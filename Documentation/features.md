# System Context & Architecture Map

This file exists to help a new intern understand how the project is structured, where the business logic lives, and where to make changes safely.

It is a working guide for the current project, not a legal specification document. When there is a mismatch, the SQL files and API implementations are the real source of truth.

## 1. High-level project shape

The app is a full CMS-style content platform built with:

- Frontend: React 19 + TypeScript + Vite
- Styling: Tailwind CSS and shadcn/ui components
- Routing: TanStack Router
- Data fetching: TanStack React Query
- Backend: PHP endpoints in the api folder
- Data storage: MySQL/MariaDB

The app is split into two major layers:

1. Frontend app in [src](src)
2. Server-side API and database logic in [api](api)

## 2. Folder map

```text
/
├── api/
│   ├── articles/
│   ├── auth/
│   ├── categories/
│   ├── config/
│   ├── cron/
│   ├── faqs/
│   ├── images/
│   ├── migrations/
│   ├── pdfs/
│   └── users/
├── public/
├── src/
│   ├── components/
│   ├── features/
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── faq/
│   │   └── insights/
│   ├── hooks/
│   ├── lib/
│   ├── routes/
│   ├── services/
│   └── shared/
│       ├── components/
│       └── layout/
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
├── DB_schema.md
├── features.md
└── api/database.sql
```

## 3. Frontend architecture

### Routing and pages
Most user-facing pages live in [src/routes](src/routes). This is the route layer for the app.

Key route groups include:
- public article listing and detail pages
- FAQ pages
- admin dashboard routes
- article creation and editing flows

The root layout in [src/routes/__root.tsx](src/routes/__root.tsx) wraps the app in the React Query provider and decides whether the public header/footer should render.

### Feature modules
Feature work is organized under [src/features](src/features):

- auth: login, reset password, session-related UI
- admin: CMS and admin dashboard tools
- insights: public article listing and article display
- faq: public FAQ experience

### Shared UI and app utilities
- [src/shared/layout](src/shared/layout): site header/footer/layout wrappers
- [src/lib/api.ts](src/lib/api.ts): central API client used by the frontend
- [src/lib/permissions.ts](src/lib/permissions.ts): role permission logic
- [src/services](src/services): mock or demo data access patterns

## 4. Backend architecture

The backend is a PHP API under [api](api). The app is not a full Node/Express backend; it is a server-side PHP layer that handles database access and session validation.

Important backend folders:
- [api/auth](api/auth): login/logout/session/password reset logic
- [api/articles](api/articles): article CRUD, schedule, publish, unschedule
- [api/faqs](api/faqs): FAQ CRUD endpoints
- [api/categories](api/categories): category management
- [api/users](api/users): user management endpoints
- [api/config](api/config): DB, session, and datetime helpers
- [api/cron](api/cron): scheduled publishing job logic
- [api/migrations](api/migrations): schema changes applied over time

## 5. Auth and session model

Authentication is server-driven:

- The PHP backend handles login and creates the session
- The frontend uses cookie-based requests and server-side checks
- The session validation endpoint is [api/auth/session.php](api/auth/session.php)

The important idea is that the frontend should not be trusted as the source of user auth; the PHP layer decides whether a user is allowed to proceed.

## 6. Content and workflow model

The project is a CMS for content operations:

- Articles are published, scheduled, reviewed, and approved
- FAQs are categorized and published similarly
- Categories are shared across content types
- Review history tracks major editorial decisions

Important workflow files:
- [api/articles/schedule.php](api/articles/schedule.php)
- [api/articles/publish.php](api/articles/publish.php)
- [api/articles/unschedule.php](api/articles/unschedule.php)
- [api/cron/publish_scheduled.php](api/cron/publish_scheduled.php)
- [api/config/datetime.php](api/config/datetime.php)

## 7. API client pattern

The frontend communicates through [src/lib/api.ts](src/lib/api.ts).

This file centralizes all API calls and exposes endpoint groups such as:
- articlesApi
- usersApi
- faqsApi
- categoriesApi
- imagesApi
- pdfsApi

This is the main place to update when a frontend feature needs to call a PHP endpoint.

## 8. Where to make changes

If you are a new intern, this is the quickest mental map:

- UI page or route: [src/routes](src/routes)
- Feature component logic: [src/features](src/features)
- Shared request logic: [src/lib/api.ts](src/lib/api.ts)
- Backend endpoint: [api](api)
- Schema changes: [api/database.sql](api/database.sql) and [api/migrations](api/migrations)
- Auth/session logic: [api/auth](api/auth)
- Scheduled publish logic: [api/cron](api/cron)

## 9. Important notes for handover

- This project is not built around a single giant backend service; it is a PHP + MySQL CMS with a React frontend.
- The SQL schema in [api/database.sql](api/database.sql) is the stable baseline, while migration files reflect newer updates.
- Schedule/publish/status logic matters and is part of the real business flow.
- Old docs or notes can drift; in a live project, the source code and SQL files are the final authority.

## 10. One-line summary

This project is a content management system for newsletters and FAQs, with a React frontend, PHP API layer, and MySQL schema that supports auth, editorial review, article scheduling, and public content pages.
