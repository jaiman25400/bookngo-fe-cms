# BookNGo CMS Frontend Onboarding

This document gives new contributors the context they need to understand the CMS frontend for BookNGo and get productive quickly. It covers architecture, conventions, environment variables, and the steps required to bring the project up locally.

---

## Project Overview

The BookNGo CMS frontend is a role-aware administrative interface built with Next.js 15 (App Router). It connects to the BookNGo backend services to manage inventory, activities, zones, teams, and user profiles. Authentication relies on backend-issued JWTs stored in cookies, and access control is enforced client-side via middleware and per-route logic.

### Key Capabilities
- Secure login and password setup flows under `(Public Pages)`
- Authenticated dashboards and CRUD interfaces under `(Protected Pages)`
- Role-based gating in `middleware.ts`, with special handling for `Admin`, `Manager`, and `Team` roles
- Shared form/table UX for domain entities (Activities, Inventory Items, Zones, Teams)
- Axios-based API abstraction with centralized error handling in `src/app/utils/api.ts`
- Tailwind CSS styling with project-wide globals in `src/app/styles/globals.css`

---

## Tech Stack at a Glance
- **Framework:** Next.js 15.1 (App Router)
- **Language:** TypeScript (TS config in `tsconfig.json`)
- **UI:** React 19 with Tailwind CSS 3
- **Auth & Security:** JWT verification via `jose`, middleware-controlled route access
- **HTTP Client:** Axios (centralized configuration and interceptors)
- **Linting & Formatting:** ESLint (Next.js defaults) configured by `eslint.config.mjs`
- **Package Manager:** npm (lockfile committed)

---

## High-Level Architecture
- **Public entry points** live under `src/app/(Public Pages)/`. These pages avoid middleware blocks and include `login` and `setup-password`.
- **Protected routes** live under `src/app/(Protected Pages)/`. The layout adds authenticated chrome (e.g., `Navbar`), and inner routes handle domain-specific CRUD.
- **Middleware (`src/middleware.ts`)** runs on every request, checking for a `token` cookie, decoding it with `JWT_SECRET`, and redirecting unauthenticated users to `/login`. Role restrictions prevent non-admins from accessing sensitive paths like `/activity/add`.
- **API Surface:** Each feature area has a lightweight `api/*.ts` module wrapping Axios calls (e.g., `activity.ts`, `inventory.ts`). This keeps components focused on rendering and state.
- **Shared Components:** Cross-cutting UI (e.g., `Navbar` and entity-specific tables/forms) resides under `src/components` or feature folders.

---

## Repository Layout
- `src/app/(Public Pages)/login/` – Login page and POST handler for `/auth/login`.
- `src/app/(Public Pages)/setup-password/` – Initial password setup flow for invited users.
- `src/app/(Protected Pages)/activity/` – Activity list (`page.tsx`), creation form, API helpers, and type definitions.
- `src/app/(Protected Pages)/inventory/` – Inventory CRUD screens, shared delete modal, and DTO typings.
- `src/app/(Protected Pages)/zone/` – Zone management table, form, and deletion modal.
- `src/app/(Protected Pages)/team/` – Team listing and creation splt view.
- `src/app/(Protected Pages)/profile/` – User profile screen plus API typings.
- `src/components/Navbar.tsx` – Global navigation rendered for authenticated users.
- `src/app/utils/api.ts` – Axios instance with base URL, credential support, and error normalization.
- `public/` – Static assets and icons referenced by Next.js.
- `docs/` – Project documentation (this file and future guides).

---

## Required Environment Variables

Create a `.env.local` in the project root (`bookngo-fe-cms/.env.local`) before running the app. Required keys:

| Variable | Description |
| --- | --- |
| `SERVER_API_BASE_URL` | Base URL for the BookNGo backend (default `http://localhost:3000`). All API modules reference this. |
| `JWT_SECRET` | Shared secret used by both backend and frontend middleware to verify the `token` cookie. Must match the backend’s signing secret. |

Optional (for future Auth0 integration or specialized environments):

| Variable | Description |
| --- | --- |
| `AUTH0_SECRET`, `AUTH0_BASE_URL`, `AUTH0_ISSUER_BASE_URL`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET` | Only needed if the Auth0 integration via `@auth0/nextjs-auth0` becomes active. |

> **Tip:** Restart the dev server whenever you change `.env.local` values so Next.js reloads the environment.

---

## External Services & Datastores
- **BookNGo API:** The frontend delegates all CRUD to the backend. Ensure the API is running locally or reachable from your machine. Coordinate with the backend repo for instructions on seeding, running migrations, and exposing REST endpoints such as `/auth/login`, `/activities`, `/inventory`, `/zones`, and `/team`.
- **PostgreSQL:** The backend persists data in PostgreSQL. Run a local instance (Docker or native) and point the backend to it. Provide matching credentials when seeding or generating tokens so the frontend can authenticate successfully.
- **Authentication Tokens:** Since the frontend validates JWTs via middleware, a valid backend-issued `token` cookie is mandatory. Use the login or setup-password flow to obtain a fresh token against your local backend.

---

## Local Development Setup
1. **Install prerequisites**
   - Node.js ≥ 20.x (LTS recommended)
   - npm ≥ 10 (bundled with Node)
   - Docker (optional) if you prefer to run PostgreSQL via container
2. **Clone repositories**
   - Frontend: `git clone https://github.com/<org>/BookNGo-FE-CMS.git`
   - Backend/API: `git clone https://github.com/<org>/BookNGo-API.git` (actual path may differ; confirm with the team)
3. **Install frontend dependencies**
   ```bash
   cd bookngo-fe-cms
   npm install
   ```
4. **Configure environment variables**
   - Copy `.env.example` if provided (otherwise create `.env.local` manually).
   - Set `SERVER_API_BASE_URL`, `JWT_SECRET`, and any Auth0 keys if relevant.
5. **Prepare backend services**
   - Install backend dependencies.
   - Configure backend `.env` (database credentials, JWT secret, etc.).
   - Start PostgreSQL and apply migrations or seed data.
   - Run the backend server so it listens on the URL you set for `SERVER_API_BASE_URL`.
6. **Run the frontend**
   ```bash
   npm run dev         # starts on http://localhost:3000
   # or, if you prefer CMS-only port mapping:
   npm run start:cms-frontend  # http://localhost:3001
   ```
7. **Login and verify**
   - Navigate to the login page, authenticate against the backend, and confirm you can reach protected routes without middleware redirects.

---

## Common Development Tasks
- **Code quality:** `npm run lint`
- **Type checking:** TypeScript runs during Next.js builds; consider `tsc --noEmit` for standalone checks.
- **Production build:** `npm run build` followed by `npm start`
- **Adding new routes:** Create a folder under `src/app/(Protected Pages)/` or `(Public Pages)/` as needed. Update middleware restrictions if access rules change.
- **API interactions:** Wrap new HTTP calls in a feature-specific `api/*.ts` module to keep components declarative.

---

## Testing & Verification
- There are currently no automated UI or integration tests in the repository. When adding features, consider introducing unit tests (e.g., via Jest) or integration tests (e.g., Playwright) in future work.
- Verify role restrictions manually: log in as different roles or manipulate JWT payloads in a controlled environment to ensure middleware behaves as expected.

---

## Deployment Notes
- Production builds require the same environment variables as local (`SERVER_API_BASE_URL`, `JWT_SECRET`).
- Ensure the backend endpoint is reachable from the deployed frontend environment and supports HTTPS if you host the CMS under TLS.
- Coordinate releases with backend schema changes; frontend features assume the presence of routes exposed by the API.

---

Welcome aboard! Reach out to the BookNGo team for backend repository access, shared secrets, and sample datasets. Happy shipping.

