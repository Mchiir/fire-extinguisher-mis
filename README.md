# Fire Extinguisher Management Information System (MIS)

A microservices-based web application for managing fire extinguishers, inspections, maintenance, notifications, and reports. Built with a good system flow **Route → Controller → Service → Model** architecture and synchronous REST communication.

## Project Overview

The system supports three roles:

| Role | Capabilities |
|------|----------------|
| **ADMIN** | Manage users, extinguishers, inspections, reports; register inspectors |
| **INSPECTOR** | View assigned inspections, complete inspections, log maintenance |
| **USER** | View extinguishers, schedule inspections, view maintenance & notifications |

Default signup role is **USER**. Admin is seeded manually. Inspectors are created by Admin via the Users page.

## Architecture

```
fire-extinguisher-mis/
├── services/          # 7 Node.js microservices
├── gateway/           # Nginx API gateway
├── frontend/          # React (Vite) SPA
├── docs/              # Mermaid & DBML documentation
└── docker-compose.yml
```

See [docs/system-architecture.mmd](docs/system-architecture.mmd) and [docs/inspection-flow.mmd](docs/inspection-flow.mmd).

### Services

| Service | Port | Database | Responsibility |
|---------|------|----------|----------------|
| auth-service | 3001 | auth_db | JWT auth, refresh rotation, profile |
| user-service | 3002 | auth_db (shared users) | User CRUD, inspector verification |
| extinguisher-service | 3003 | extinguisher_db | Fire extinguisher inventory |
| inspection-service | 3004 | inspection_db | Inspection scheduling & workflow |
| maintenance-service | 3005 | maintenance_db | Maintenance records |
| notification-service | 3006 | notification_db | Alerts & cron jobs |
| report-service | 3007 | — (stateless) | Aggregated reports |

**API Gateway:** `http://localhost:8080` — single entry point at `/api/*`

## Tech Stack

**Backend:** Node.js (ESM), Express, MongoDB, Mongoose, Joi, JWT, Swagger, Morgan, Winston, node-cron, npm

**Frontend:** React, Vite, React Router, TailwindCSS, Lucide, React Hot Toast, SweetAlert2, Fetch API

**Infrastructure:** Docker, Docker Compose, Nginx

## Installation

### Prerequisites

- Node.js 18+
- pnpm 8+
- Docker & Docker Compose (optional)

### Install dependencies

```bash
pnpm install
```

Copy environment files:

```bash
cp .env.example .env
cp services/auth-service/.env.example services/auth-service/.env
# Repeat for other services as needed
cp frontend/.env.example frontend/.env
```

Use the **same** `JWT_ACCESS_SECRET` across all services.

## Docker Setup

```bash
docker compose up --build
# add -d for detached/daemon mode
```

| URL | Description |
|-----|-------------|
| http://localhost:5173 | Frontend (Vite) |
| http://localhost:8080/api | API Gateway |
| http://localhost:3001/api-docs | Auth Swagger (per service) |

Seed admin after Mongo is up:

```bash
docker compose exec auth-service node src/database/seedAdmin.js
# Or locally:
pnpm seed:admin
```

Default admin: `admin@firemis.com` / `Admin@123`

## Running Locally

1. Start MongoDB: `docker run -d -p 27017:27017 mongo:7`
2. Run each service (separate terminals):

```bash
pnpm dev:auth
pnpm dev:user
pnpm dev:extinguisher
pnpm dev:inspection
pnpm dev:maintenance
pnpm dev:notification
pnpm dev:report
```

3. Start frontend: `pnpm dev:frontend`
4. Use gateway with Nginx locally, or point frontend to `http://localhost:8080/api` and run services directly on ports 3001–3007.

For Vite dev proxy, set `VITE_API_URL=/api` and run gateway on 8080, or set full URL per service port (auth only works with cookies via gateway for refresh).

## Environment Variables

| Variable | Description |
|----------|-------------|
| `JWT_ACCESS_SECRET` | Shared access token secret (all services) |
| `JWT_REFRESH_SECRET` | Refresh token secret (auth-service) |
| `MONGODB_URI` | Per-service MongoDB connection |
| `FRONTEND_URL` | CORS origin (default `http://localhost:5173`) |
| `SERVICE_TOKEN` | Internal token for notification-service |
| `*_SERVICE_URL` | Inter-service base URLs |

## API Documentation

- **Gateway index:** `GET http://localhost:8080/api/docs`
- **Per-service Swagger:** `http://localhost:<port>/api-docs`

### Gateway routes

| Path | Service |
|------|---------|
| `/api/auth/*` | auth-service |
| `/api/users/*` | user-service |
| `/api/extinguishers/*` | extinguisher-service |
| `/api/inspections/*` | inspection-service |
| `/api/maintenance/*` | maintenance-service |
| `/api/notifications/*` | notification-service |
| `/api/reports/*` | report-service |

### Auth endpoints

- `POST /api/auth/register` — default role USER
- `POST /api/auth/login`
- `POST /api/auth/refresh` — HTTP-only cookie, rotation
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `PUT /api/auth/profile`
- `PUT /api/auth/change-password`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

## Scheduled Jobs

**notification-service** (daily 08:00 UTC):

- Expiry alerts (30 days)
- Mark expired extinguishers
- Inspection reminders

**report-service** (weekly Monday 08:00 UTC):

- Summary report logging

## Folder Structure (per service)

```
src/
├── app.js
├── server.js
config/
constants/
controllers/
database/
middlewares/
models/
routes/
schemas/
services/
swagger/
utils/          # ApiError, asyncHandler, logger
```

## Roles and Permissions

- **Access token:** short-lived, stored in frontend memory
- **Refresh token:** HTTP-only cookie, `SameSite=Lax`, rotation + `tokenVersion` invalidation
- **RBAC:** `authenticate` + `authorize(roles)` middleware on protected routes

## Documentation

- [docs/system-architecture.mmd](docs/system-architecture.mmd)
- [docs/inspection-flow.mmd](docs/inspection-flow.mmd)
- DBML schemas: `docs/*.dbml`

## Database backing up

```bash
# dump
docker compose exec -T mongo mongodump --archive > ./all_databases.dump

# specific database
docker compose exec -T mongo mongodump --db=extinguisher_db --archive > ./extinguisher_db.dump

# import
docker compose exec -i mongo mongorestore --archive < ./all_databases.dump

# specific db
docker compose exec -i mongo mongorestore --archive < ./extinguisher_db.dump
```

## License

MIT
