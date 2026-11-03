-- Phase 5: Newsletter scheduling
-- Run once on the production database.

ALTER TABLE articles
  ADD COLUMN scheduled_at DATETIME NULL AFTER approved_at,
  ADD COLUMN published_at DATETIME NULL AFTER scheduled_at;

ALTER TABLE articles
  MODIFY COLUMN status ENUM(
    'draft', 'submitted', 'approved', 'scheduled', 'published', 'rejected'
  ) NOT NULL DEFAULT 'draft';

-- Optional audit trail for scheduling
ALTER TABLE review_history
  MODIFY COLUMN decision ENUM(
    'submitted', 'approved', 'rejected', 'scheduled', 'published'
  ) NOT NULL;
