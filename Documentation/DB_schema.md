# Database Schema Reference

This file is the project’s practical database guide for interns and developers. It explains the tables that matter for the CMS, auth flow, content approval, and scheduled publishing.

Use it as a working reference, but treat the actual SQL in [api/database.sql](api/database.sql) and the migration files under [api/migrations](api/migrations) as the source of truth.

## 1. Current active schema overview

The active project schema is centered on these core tables:

- roles
- users
- password_history
- admin_log
- categories
- articles
- faqs
- uploads
- review_history

## 2. Core tables and purpose

### roles
Purpose: defines the app’s user roles.

Columns:
- id: primary key
- name: role name such as admin, manager, employee
- created_at: record creation timestamp

### users
Purpose: authentication and profile data.

Columns:
- id: primary key
- email: login email, unique
- password_hash: hashed password
- secret_code: password recovery / reset code
- role_id: FK to roles.id
- status: active/inactive user state
- created_by: user who created this account
- created_at: account creation time
- updated_at: last update time
- last_login_at: optional login tracking
- last_password_reset_at: optional password reset tracking
- is_deleted: soft-delete flag (if used in app logic)

Notes:
- This is the main identity table for the admin system.
- The app uses role-based access patterns and server-side session checks.

### password_history
Purpose: keeps a history of password changes for audit/recovery tracking.

Columns:
- id: primary key
- user_id: FK to users.id
- old_password_hash: previous password hash
- new_password_hash: new password hash
- reset_at: timestamp of password change

### admin_log
Purpose: records system activity such as login and password reset events.

Columns:
- id: primary key
- action: action name like login or password_reset
- actor_id: user responsible for the action
- description: descriptive log text
- created_at: timestamp

Notes:
- The current implementation uses actor_id and description, not the older entity-based log structure described in older docs.

### categories
Purpose: shared categories for both articles and FAQs.

Columns:
- id: primary key
- name: category name
- type: articles or faqs
- slug: URL-friendly slug
- color: optional UI color
- created_at: category creation time

Notes:
- Categories are reused across content types.
- The app resolves article and FAQ categories by name or by category_id depending on the endpoint.

### articles
Purpose: stores newsletters / insights content.

Columns:
- id: primary key
- slug: article URL slug
- title: article headline
- excerpt: short summary
- featured_image_url: main image URL
- body: long HTML/markdown content
- category_id: FK to categories.id
- status: article lifecycle state
- author: legacy author display field
- created_at: creation time
- updated_at: last update time
- author_id: FK to users.id
- approved_by: user who approved the article
- approved_at: approval timestamp
- submitted_at: submission timestamp
- content_source: cms or pdf
- pdf_file_path: PDF location if content came from PDF
- scheduled_at: scheduled publication time
- published_at: actual publication time

Notes:
- status includes draft, submitted, approved, scheduled, published, rejected in the current workflow.
- author and author_id both exist because author is a legacy display value while author_id is the actual relation to the user table.
- Scheduled publishing is implemented in the migration files and cron workflow.

### faqs
Purpose: stores FAQ questions and answers.

Columns:
- id: primary key
- question: FAQ text
- answer: FAQ answer
- category_id: FK to categories.id
- status: draft/submitted/approved/published/rejected lifecycle
- order: display ordering
- created_at: creation time
- updated_at: last update time
- author_id: FK to users.id
- approved_by: FK to users.id
- approved_at: approval timestamp
- submitted_at: submission timestamp

### uploads
Purpose: tracks uploaded files associated with content.

Columns:
- id: primary key
- filename: stored file name
- original_name: original upload name
- mime_type: file type
- size: file size in bytes
- path: stored file path
- article_id: related article
- uploaded_by: FK to users.id
- created_at: upload timestamp

Notes:
- This table is used for assets and media uploads.
- The size column is an important field and should be treated as the file size in bytes.

### review_history
Purpose: audit trail for content review decisions.

Columns:
- id: primary key
- content_type: article / faq
- content_id: related content item
- reviewer_id: FK to users.id
- decision: submitted, approved, rejected, scheduled, published
- notes: review comment or reason
- created_at: action timestamp

Notes:
- This is the main audit trail for editorial approval and publishing decisions.

## 3. Important schema realities for this project

- There is no active user_sessions table in the current schema used by the app.
- The current app relies more on PHP session cookies and session checks than on a dedicated session table.
- The database has evolved over time using migration files; older docs may mention older structures that are no longer active.
- Scheduled publishing is part of the real data model, not just a planned feature.
- The article status flow is not limited to draft/submitted/approved/published; scheduled is an active state.

## 4. Source of truth

When in doubt, check these first:

- [api/database.sql](api/database.sql)
- [api/migrations](api/migrations)
- [api/articles](api/articles)
- [api/faqs](api/faqs)
- [api/auth](api/auth)
- [api/config](api/config)

This file is meant to help a new developer understand the system quickly, not to replace the working SQL files.