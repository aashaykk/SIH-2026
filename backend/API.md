# NAGAR-X Backend API Documentation

NAGAR-X is the civic backend interface for the **AI-Powered Civic Intelligence & Resolution Network** prototype (SIH 2026). It manages authentication, civic issue creation with AI-keyword-based classifications, geo-spatial duplicate checks, priority calculations, routing, SLA management, and citizen verification.

---

## Getting Started

### 1. Database Setup (Supabase)
This project connects to a cloud-hosted **Supabase Postgres** instance. You will need your project's database connection strings.

1. Go to your **Supabase Dashboard** ➔ **Settings** ➔ **Database**.
2. Copy the **URI** connection string under **Connection pooler**.

### 2. Installation
Open a terminal in the `backend/` directory:
```bash
cd backend
npm install
```

### 3. Environment Configuration
Copy the `.env.example` file and create a `.env` file in the `backend/` directory:
```bash
cp .env.example .env
```
Modify `.env` to include your Supabase transaction connection string under `DATABASE_URL` and session mode under `DIRECT_URL`. Make sure to replace `[YOUR-PASSWORD]` with your actual database password.

### 4. Run the Server
To start the backend in development mode (with auto-reload via nodemon):
```bash
npm run dev
```

On server startup, the tables (`users` and `issues`) will be automatically created in the database and seeded with three test users:
* **Citizen Account**: `citizen@nagarx.gov` (password: `password123`)
* **Officer Account**: `officer@nagarx.gov` (password: `password123`)
* **Admin Account**: `admin@nagarx.gov` (password: `password123`)

---

## Authentication Headers
All protected routes require a JWT token in the Authorization header.
```http
Authorization: Bearer <JWT_TOKEN>
```

---

## API Catalog

### 1. Authentication

#### Register User
* **Method**: `POST`
* **URL**: `/api/auth/register`
* **Public**: Yes
* **Request Body**:
```json
{
  "name": "Jane Citizen",
  "email": "jane@gmail.com",
  "password": "password123",
  "role": "CITIZEN"
}
```
* **Response (Success - 201 Created)**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "27fd368d-8c17-48f8-aaee-c187d9a3fe21",
      "name": "Jane Citizen",
      "email": "jane@gmail.com",
      "role": "CITIZEN"
    }
  }
}
```

#### Login User
* **Method**: `POST`
* **URL**: `/api/auth/login`
* **Public**: Yes
* **Request Body**:
```json
{
  "email": "citizen@nagarx.gov",
  "password": "password123"
}
```
* **Response (Success - 200 OK)**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "8a32a6f8-4e1b-4cd7-8e6d-927361a8ef14",
      "name": "NagarX Citizen",
      "email": "citizen@nagarx.gov",
      "role": "CITIZEN"
    }
  }
}
```

---

### 2. Issues

#### Create Civic Issue
Report a new issue. The endpoint accepts a multipart form request to receive GPS locations, descriptions, and the image capture file.
* **Method**: `POST`
* **URL**: `/api/issues`
* **Protected**: Yes
* **Headers**: `Content-Type: multipart/form-data`
* **Parameters (Form Fields)**:
  * `image` (File binary) - Pothole/Garbage/Streetlight photo
  * `description` (String) - Details about the issue.
  * `latitude` (Number/Float) - GPS Latitude (e.g. `28.6139`)
  * `longitude` (Number/Float) - GPS Longitude (e.g. `77.2090`)

* **Response (Success - 201 Created / 200 OK for Duplicate Update)**:
```json
{
  "success": true,
  "data": {
    "id": "e0e84b8d-2aef-4ca4-9271-70bf81ff8217",
    "title": "GARBAGE Incident",
    "description": "Garbage piles blocking the primary sidewalk.",
    "category": "GARBAGE",
    "severity": "MEDIUM",
    "priority": "MEDIUM",
    "status": "REPORTED",
    "imageUrl": "http://localhost:3000/uploads/issues/issue-1724503714902-12498762.jpg",
    "latitude": 28.6139,
    "longitude": 77.209,
    "reportCount": 1,
    "department": "SANITATION",
    "assignedOfficer": null,
    "aiConfidence": 0.92,
    "slaDeadline": "2026-08-25T08:58:38.000Z",
    "createdAt": "2026-08-24T08:58:38.000Z",
    "updatedAt": "2026-08-24T08:58:38.000Z"
  }
}
```

* **Note on Duplicate Detection**: If an unverified issue of the same category is found within 100 meters, a new issue is **not** created. The existing issue's `reportCount` increments, and its `priority` is recalculated and returned.
```json
{
  "success": true,
  "message": "Duplicate issue detected. Report count incremented.",
  "data": {
    "id": "e0e84b8d-2aef-4ca4-9271-70bf81ff8217",
    "title": "GARBAGE Incident",
    "reportCount": 2,
    "priority": "HIGH",
    "status": "REPORTED"
    // ...
  }
}
```

#### Get All Issues
Retrieve all issues. Supports optional query filtering.
* **Method**: `GET`
* **URL**: `/api/issues`
* **Protected**: Yes
* **Query Parameters** (Optional):
  * `status` (REPORTED, ACKNOWLEDGED, IN_PROGRESS, RESOLVED, VERIFIED, REOPENED)
  * `category` (ROAD_DAMAGE, GARBAGE, STREETLIGHT, WATER_LEAKAGE, OTHER)
  * `department` (ROADS, SANITATION, ELECTRICAL, WATER, GENERAL)
  * `assignedOfficer` (UUID string)
* **Response (Success - 200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "e0e84b8d-2aef-4ca4-9271-70bf81ff8217",
      "title": "GARBAGE Incident",
      "category": "GARBAGE",
      "status": "REPORTED",
      "imageUrl": "http://localhost:3000/uploads/issues/issue-1724503714902-12498762.jpg",
      "reportCount": 1
      // ...
    }
  ]
}
```

#### Get Issue by ID
Fetch detailed information for a single issue.
* **Method**: `GET`
* **URL**: `/api/issues/:id`
* **Protected**: Yes
* **Response (Success - 200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "e0e84b8d-2aef-4ca4-9271-70bf81ff8217",
    "title": "GARBAGE Incident",
    "description": "Garbage piles blocking the primary sidewalk."
    // ...
  }
}
```

#### Update Issue Status
Advance the workflow of an issue. Valid transitions are restricted to protect lifecycle sanity.
* **Method**: `PATCH`
* **URL**: `/api/issues/:id/status`
* **Protected**: Yes
* **Request Body**:
```json
{
  "status": "IN_PROGRESS"
}
```
* **Response (Success - 200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "e0e84b8d-2aef-4ca4-9271-70bf81ff8217",
    "status": "IN_PROGRESS"
    // ...
  }
}
```

* **Workflow Transition Rules**:
  * `REPORTED` ➔ `ACKNOWLEDGED`, `IN_PROGRESS`, `RESOLVED`
  * `ACKNOWLEDGED` ➔ `IN_PROGRESS`, `RESOLVED`
  * `IN_PROGRESS` ➔ `RESOLVED`
  * `RESOLVED` ➔ `VERIFIED`, `REOPENED`
  * `VERIFIED` ➔ `REOPENED`
  * `REOPENED` ➔ `IN_PROGRESS`, `RESOLVED`

#### Assign Issue Officer
Assign a municipal officer user to resolve the issue. Note that if the issue was previously in the `REPORTED` or `REOPENED` status, assigning an officer will automatically advance the status to `ACKNOWLEDGED`.
* **Method**: `PATCH`
* **URL**: `/api/issues/:id/assign`
* **Protected**: Yes (Requires role `OFFICER` or `ADMIN`)
* **Request Body**:
```json
{
  "assignedOfficer": "4693a89e-5e9c-4bf7-817a-0a7362a74cde"
}
```
* **Response (Success - 200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "e0e84b8d-2aef-4ca4-9271-70bf81ff8217",
    "status": "ACKNOWLEDGED",
    "assignedOfficer": "4693a89e-5e9c-4bf7-817a-0a7362a74cde"
    // ...
  }
}
```

#### Verify Issue Resolution
Citizen verification of the resolution. If the resolution is rejected, the status changes to `REOPENED`.
* **Method**: `POST`
* **URL**: `/api/issues/:id/verify`
* **Protected**: Yes
* **Request Body**:
```json
{
  "verified": true
}
```
* **Response (Success - 200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "e0e84b8d-2aef-4ca4-9271-70bf81ff8217",
    "status": "VERIFIED"
    // ...
  }
}
```

#### Reopen Issue
Reopen an issue that has been incorrectly resolved or needs additional attention.
* **Method**: `POST`
* **URL**: `/api/issues/:id/reopen`
* **Protected**: Yes
* **Response (Success - 200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "e0e84b8d-2aef-4ca4-9271-70bf81ff8217",
    "status": "REOPENED"
    // ...
  }
}
```

---

## Local Verification Commands (cURL example)

1. **Login as citizen**:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"citizen@nagarx.gov\",\"password\":\"password123\"}"
```

2. **Create Issue (Multipart request)**:
```bash
curl -X POST http://localhost:3000/api/issues \
  -H "Authorization: Bearer <TOKEN_FROM_STEP_1>" \
  -F "image=@/path/to/pothole.jpg" \
  -F "description=Pothole leaking water on Main Road" \
  -F "latitude=28.6139" \
  -F "longitude=77.2090"
```
*(Notice how the keyword "water" triggers classifications of `WATER_LEAKAGE` instead of the default `ROAD_DAMAGE`.)*
