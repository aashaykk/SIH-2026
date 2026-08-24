# NAGAR-X Web Dashboard
## Civic Command Center — Municipal Intelligence Dashboard

**SIH 2026 | Problem Statement #43 | Team Aperture | Bhavya (BK)**

---

## Quick Start

```bash
# 1. Install deps
npm install

# 2. Set env (copy and edit)
cp .env.example .env

# 3. Run in mock mode (no backend needed)
VITE_USE_MOCK=true npm run dev

# 4. Run connected to backend
npm run dev

# 5. Tests
npm test
npm run test:coverage
```

---

## Architecture

```
src/
├── types/index.ts          ← ALL TypeScript types (single source of truth)
├── utils/index.ts          ← Pure utility functions (all tested)
├── utils/mockData.ts       ← Demo data for dev/fallback
├── services/
│   ├── api.ts              ← Axios instance, JWT inject, error normalise
│   ├── incidents.ts        ← Incident API calls (+ mock fallback)
│   └── analytics.ts        ← Hotspot + ward analytics API
├── hooks/
│   ├── useSocket.ts        ← Socket.IO connection + typed event subscription
│   ├── useIncidents.ts     ← TanStack Query wrappers for incidents
│   └── useDashboard.ts     ← Ward stats, dept stats, hotspots
├── components/
│   ├── shared/             ← Reusable: badges, skeleton, error, empty states
│   ├── dashboard/          ← KPI cards, AI activity feed, dept status
│   ├── incidents/          ← Card, timeline, priority explainer, assign modal
│   └── map/                ← Leaflet map with incident markers
└── pages/
    ├── Dashboard.tsx       ← Main command center
    ├── Analytics.tsx       ← Hotspots + predictions
    └── Login.tsx           ← Auth
```

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:5000` | Backend base URL |
| `VITE_SOCKET_URL` | `http://localhost:5000` | Socket.IO URL |
| `VITE_USE_MOCK` | `false` | Use mock data instead of real API |
| `VITE_DEFAULT_LAT` | `23.2156` | Map default center (Gandhinagar) |
| `VITE_DEFAULT_LNG` | `72.6369` | Map default center |
| `VITE_DEFAULT_ZOOM` | `13` | Default map zoom |

---

## API Contract

The dashboard consumes these backend endpoints:

```
GET  /api/incidents              ?status=&priority=&departmentId=&page=&sortBy=
GET  /api/incidents/:id
GET  /api/incidents/:id/timeline
POST /api/incidents/:id/assign   body: { workerId }
PATCH /api/incidents/:id/status  body: { status }
GET  /api/wards/:id/dashboard
GET  /api/analytics/departments
GET  /api/analytics/hotspots     ?wardId=
GET  /api/departments/:id/workers ?available=true
POST /api/auth/login             body: { email, password }
GET  /api/auth/me
```

### Response: Incident
```json
{
  "id": "INC-1042",
  "title": "Garbage Accumulation Near Market",
  "category": "GARBAGE",
  "status": "ASSIGNED",
  "priority": "HIGH",
  "priorityScore": 87,
  "priorityReasons": ["8 citizens reported", "Unresolved 18h"],
  "latitude": 23.2078, "longitude": 72.6397,
  "wardName": "Ward 17",
  "departmentName": "SANITATION",
  "reportCount": 8,
  "civicSignalStrength": 91,
  "slaDeadline": "2025-01-01T10:00:00Z",
  "slaStatus": "YELLOW",
  "slaRemainingMs": 14400000,
  "slaTotalMs": 86400000,
  "aiConfidence": 0.96
}
```

### Socket.IO Events (backend → dashboard)
```
incident.created          { incident: Incident }
incident.status_changed   { incidentId, status, previousStatus }
incident.assigned         { incidentId, workerName }
incident.escalated        { incidentId, escalationLevel, reason }
ai.activity               { id, timestamp, agent, message, type, incidentId }
```

---

## Failure Scenarios Handled

| Scenario | Behaviour |
|---|---|
| Backend down | Mock mode (`VITE_USE_MOCK=true`) or `ErrorState` component with retry |
| Socket.IO disconnected | `ConnectionIndicator` shows Offline; queries still work via REST |
| JWT expired | Auto-redirect to `/login` |
| No incidents match filter | `EmptyState` component |
| No available workers | Modal shows guidance message |
| Map tile server unreachable | Leaflet degrades gracefully (grey tiles) |
| AI confidence < 50% | System routes to manual review (handled by backend) |

---

## Integration Checklist (for Aashay/Shreya backend)

- [ ] `GET /api/incidents` returns `PaginatedResponse<Incident>` shape
- [ ] All `Incident` fields present (especially `priorityReasons[]`, `civicSignalStrength`, `slaRemainingMs`)
- [ ] `POST /api/auth/login` returns `{ token: string, user: User }`
- [ ] Socket.IO emits `ai.activity` events during processing pipeline
- [ ] Socket.IO emits `incident.created` when new incident created
- [ ] CORS configured for `http://localhost:3000`

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Ward Authority | ward17@nagarx.demo | demo1234 |
| City Admin | admin@nagarx.demo | demo1234 |
| Supervisor | supervisor@nagarx.demo | demo1234 |
