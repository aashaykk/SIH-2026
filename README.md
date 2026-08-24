# NAGAR-X — AI-Powered Civic Intelligence & Resolution Network

NAGAR-X is a state-of-the-art mobile application prototype designed for **SIH 2026**. It empowers citizens to report civic grievances (potholes, garbage, water leaks, broken lights), automatically capture geo-coordinates, receive real-time AI-powered severity classifications, track progress timelines, and verify field resolutions.

---

## 🛠️ Technology Stack

* **Core**: React Native (via Expo SDK 54)
* **Language**: TypeScript (v5.9.2)
* **Navigation**: Expo Router (v6.0.24) — file-based routing
* **UI Framework**: React Native Paper (Material Design v3) & Material Vector Icons
* **Server State**: TanStack Query (React Query v5)
* **Networking**: Axios Client with Interceptors
* **Sensors**: Expo Location (GPS), Expo Camera & Image Picker (Media capture)
* **Local Persistence**: AsyncStorage (Offline report queuing and session token caching)

---

## 📂 Project Architecture

The code resides inside the `/src` folder, organized modularly:

```text
src/
├── app/                              # Expo Router Routes & Screen Files
│   ├── (auth)/                       # Immersive Authentication Screens (Login, Register)
│   ├── (tabs)/                       # Main Bottom-Tab Views (Home, My Reports, Profile)
│   ├── issues/                       # Grievance Submission Flow (Report Form, Dynamic ID Details)
│   └── _layout.tsx                   # App Entry point (Global Providers & Route Protection)
├── components/                       # Shared Presentational UI components
│   └── UI/                           # Custom primitives (PrimaryButton, LoadingState, ErrorState, EmptyState)
├── config/                           # System Configuration
│   ├── api.ts                        # Axios instances & interceptors
│   └── constants.ts                  # Brand theme tokens, civic categories, status registry
├── features/                         # Feature specific state & hooks
│   └── auth/                         # Global user session context (AuthContext)
├── storage/                          # Local AsyncStorage adapters
│   ├── keys.ts                       # Persistent storage keys registry
│   └── session.ts                    # Session reads/writes
├── types/                            # Type definitions
│   └── models.ts                     # TypeScript data model schemas
```

---

## 🚀 Setup & Execution

Follow these steps to run the application locally on your computer and phone:

### 1. Install Dependencies
This project uses peer dependencies compatible with React 19.1. Install dependencies using:
```bash
npm install --legacy-peer-deps
```

### 2. Start the Development Server
```bash
# Start server with clean bundler cache
npx expo start -c
```

### 3. Open on Your Phone
* Download **Expo Go** on your device (Supports **SDK 54**).
* Connect your computer and mobile phone to the **same Wi-Fi network**.
* Scan the QR code displayed in the terminal.

---

## 🔒 Session & Route Protection

The routing is governed globally inside `src/app/_layout.tsx` using a **Global Navigation Guard**:
* Unauthenticated users are automatically forced to `/(auth)/login`.
* Authenticated users are automatically transitioned to the `/(tabs)` dashboard.
* Logouts clear AsyncStorage session headers and immediately trigger redirect guards.

---

## 💻 Developer Collaboration Guidelines (Git Rules)

For a clean developer workflow, adhere to these practices:

1. **Branch Naming Standard**:
   * Features: `feat/[developer-initials]-[feature-name]` (e.g., `feat/ad-location-picker`)
   * Bugfixes: `bug/[developer-initials]-[bug-name]` (e.g., `bug/ak-session-fix`)
2. **Commit Style**: Prefix commit messages cleanly:
   * `feat: add camera capture permission handler`
   * `fix: correct stylesheet border syntax in profile page`
3. **Collaboration Etiquette**:
   * Never commit directly to the `main` branch.
   * Push changes to `origin [your-feature-branch]`, compile locally using `npx tsc --noEmit` to ensure there are no compilation errors, and submit a Pull Request to `dev`.
   * Clear your local cache using `npx expo start -c` if you run into local bundler issues.
