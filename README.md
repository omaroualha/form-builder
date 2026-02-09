# Mini Form Builder

Full-stack form builder — create forms with a drag-and-drop-style builder, publish them via shareable links, and collect submissions.

Built with **Laravel 12**, **React 18 + TypeScript**, and **PostgreSQL**. Deployed with Docker and CI/CD via GitHub Actions.

**Live demo:** [http://65.21.252.253](http://65.21.252.253)

## Tech Stack

| Layer | Tech |
|-------|------|
| Backend | Laravel 12, PHP 8.2, Sanctum (token auth) |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| Database | PostgreSQL 15 |
| Infra | Docker, Nginx, GitHub Actions |
| Testing | Pest (backend), Vitest + React Testing Library (frontend) |

## Getting Started

```bash
# 1. Clone and configure
git clone https://github.com/omaroualha/form-builder.git && cd form-builder
cp backend/.env.example backend/.env

# 2. Start everything
docker compose up -d

# 3. Backend setup
docker compose exec app composer install
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate

# 4. Frontend (dev mode)
cd frontend && npm install && npm run dev
```

The app runs at [http://65.21.252.253](http://65.21.252.253) (production build) or `http://localhost:5173` (Vite dev server).

## Project Structure

```
backend/                    # Laravel API
├── app/Http/Controllers/   # Form, Auth, Submission controllers
├── app/Models/             # Form, Submission, User
├── app/Policies/           # Authorization (FormPolicy)
├── database/migrations/
├── routes/api.php
└── tests/Feature/          # Pest feature tests

frontend/                   # React SPA
├── src/api/                # OOP service layer (AbstractService → ApiHub)
├── src/features/
│   ├── auth/               # Login, Register, useAuth
│   ├── builder/            # Form builder (create/edit fields)
│   └── forms/              # Dashboard, submissions, public form
├── src/components/ui/      # shadcn/ui
└── src/test/               # Test utilities
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/register | Register |
| POST | /api/login | Login → returns token |
| POST | /api/logout | Logout (revokes token) |
| GET | /api/user | Current user |

### Forms (authenticated)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/forms | List user's forms |
| POST | /api/forms | Create form |
| GET | /api/forms/{id} | Get form |
| PUT | /api/forms/{id} | Update form |
| DELETE | /api/forms/{id} | Delete form |
| GET | /api/forms/{id}/submissions | List submissions |

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/public/forms/{slug} | Get published form |
| POST | /api/public/forms/{slug}/submit | Submit response |

## Architecture

```
Service Classes (HTTP) → React Query Hooks (cache/mutations) → Pages (UI)
```

- **API layer** — OOP services (`AuthService`, `FormService`) extending `AbstractService`, accessed through `ApiHub`
- **Hooks** — React Query wrappers handling caching, optimistic updates, side effects
- **Pages** — Pure view components consuming hooks

## Testing

```bash
# Backend (30 tests)
docker compose exec app php artisan test

# Frontend (30 tests)
cd frontend && npm test
```

## CI/CD

Push to `main` triggers GitHub Actions:
1. **test-frontend** — runs Vitest
2. **test-backend** — runs Pest against PostgreSQL
3. **deploy** — SSHs into VPS, pulls code, rebuilds Docker containers

## Docker Services

| Service | Role |
|---------|------|
| app | PHP-FPM (Laravel) |
| frontend | Nginx serving built React SPA |
| nginx | Reverse proxy — `/api` → Laravel, `/` → frontend |
| postgres | PostgreSQL 15 |
