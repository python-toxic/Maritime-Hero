# Project Context for Interns

This project is a content management system for newsletters/insights and FAQ content. The frontend is a React app, the backend is PHP, and the database is MySQL.

## 1) Big picture

- Frontend: React + TypeScript + Vite
- Routing: TanStack Router
- Data fetching: React Query
- Styling: Tailwind + shadcn/ui
- Backend: PHP scripts under `api/`
- Database: MySQL

The app is split into two main parts:
- `src/` = frontend UI and app logic
- `api/` = database access, auth/session, and CRUD APIs

## 2) How login works

Login is handled by the PHP backend, not by frontend-only logic.

Flow:
1. User submits email/password from the login form.
2. PHP endpoint in `api/auth/login.php` validates the user.
3. If valid, it creates a PHP session and sets cookie/session state.
4. The frontend later calls `api/auth/session.php` to check whether the user is still authenticated.
5. Protected routes use this session check to allow or block access.

Important:
- The app uses server-side session state.
- The frontend should not be treated as the source of auth truth.
- If something breaks, check auth endpoints before frontend logic.

## 3) How API calls work

All frontend API requests go through `src/lib/api.ts`.

This file defines API groups like:
- `articlesApi`
- `usersApi`
- `faqsApi`
- `categoriesApi`
- `imagesApi`
- `pdfsApi`

Pattern:
- API modules call `fetchApi(...)`
- `fetchApi` builds a URL, sends JSON, includes cookies, and parses responses
- Most endpoints return `{ success, data, message }`

Example:
- article list: `articlesApi.list(...)`
- category list: `categoriesApi.list(...)`
- login/session: handled by backend auth endpoints; frontend mostly checks authentication state

If a page is not loading data, start from `src/lib/api.ts` and then the matching PHP API folder.

## 4) How content flow works

The CMS mainly revolves around content lifecycle:

- draft
- submitted
- approved
- scheduled
- published
- rejected

Article workflow:
1. Admin creates/edits article.
2. Article is saved to `articles` table.
3. It may be submitted for review.
4. Review decisions are stored in `review_history`.
5. If scheduled, `scheduled_at` is set.
6. Cron job publishes content when time is reached.

The main backend logic is in:
- `api/articles/`
- `api/cron/`
- `api/config/datetime.php`

## 5) How scheduled publishing works

This is important because it is a real feature, not a placeholder.

- `scheduled_at` is stored in the `articles` table
- `api/articles/schedule.php` validates and stores the schedule
- `api/cron/publish_scheduled.php` checks due items and updates status to published
- `published_at` is also stored when the article is actually published

Time handling is a bit custom; check `api/config/datetime.php` if something looks off with timezone/date conversion.

## 6) How FAQ and categories work

Categories are shared across articles and FAQs.

- `categories` table stores `name`, `type`, `slug`
- `type` is usually `articles` or `faqs`
- Frontend pages load category filters from `categoriesApi.list(...)`

FAQ articles and article pages both follow the same pattern:
- fetch data
- filter by category/search
- display cards/list
- open detail page

## 7) Where common work happens

If you need to change behavior, start here:

- Login/auth: `api/auth/`, `src/features/auth/`
- Article pages: `src/routes/insights.*`, `api/articles/`
- Admin content management: `src/features/admin/`, `src/routes/admin.*`
- FAQ UI: `src/routes/faq.tsx`, `api/faqs/`
- API endpoints: `src/lib/api.ts`, `api/*`
- DB schema: `api/database.sql`, `api/migrations/`

## 8) Common gotchas

- Old docs may be stale; prefer real code and SQL files.
- `DB_schema.md` is a reference, but the source of truth is the actual database SQL and migrations.
- Frontend routes and backend endpoints may evolve separately; always trace the actual request path.
- Auth/session and scheduled publish logic are core business logic and should be treated carefully.

## 9) Best way to understand the app quickly

Read in this order:
1. `src/lib/api.ts`
2. `api/auth/session.php`
3. `api/articles/index.php`
4. `api/articles/schedule.php`
5. `api/cron/publish_scheduled.php`
6. one route file like `src/routes/insights.index.tsx`

This gives the fastest mental model of how frontend, API, and DB are connected without reading every file.

## 10) One-line summary

This project is a CMS for content publishing: users log in through PHP sessions, the frontend calls PHP APIs through a central fetch layer, content is reviewed and scheduled, and the app publishes articles and FAQs through a database-backed workflow.

## 11) Development Safety and AI Working Rules

### Project status

The existing Insights CMS is deployed on Hostinger and is working in production. The corporate website redesign is a new development initiative.

### Existing functionality to preserve

Unless explicitly required otherwise, preserve:

- Authentication, PHP sessions, role-based permissions, and approval workflows.
- Newsletter, Insights, and FAQ functionality.
- Scheduled publishing and its cron job.
- Existing database content and API contracts.

### Required workflow before coding

1. Inspect the repository and verify the relevant implementation.
2. Explain the existing architecture and identify relevant files.
3. Identify dependencies, potential regressions, and database changes.
4. Propose the smallest safe implementation plan.
5. Wait for approval before making high-risk or broad architectural changes.

### Implementation rules

- Make small, focused, reversible changes.
- Do not rewrite unrelated files or replace working functionality unnecessarily.
- Do not introduce new libraries without explaining their purpose.
- Never invent endpoints, database fields, functions, or permissions.
- Never expose secrets or place credentials in documentation.
- Ask for clarification when a business requirement is genuinely ambiguous.

### Testing and deployment

- Keep development separate from production.
- Back up the source code and database before significant changes.
- Test the redesigned public website under `/test/` before replacing the existing homepage.
- Verify frontend routing, API requests, authentication, permissions, database operations, and asset paths where applicable.
- Test existing CMS functionality for regressions.
- Report which tests were actually run and their results.
- Do not deploy to production without explicit approval.



### Required report after each feature

After each response/ edits / creation of files or code you have to edit the file named Ft-logs.MD,

Explaining:

1. What changed and why.
2. Which files were created, modified, or deleted.
3. How the feature works, including relevant file interactions.
4. What could fail and how to diagnose it.
5. Which tests passed or failed.
6. Which documentation needs updating. 



