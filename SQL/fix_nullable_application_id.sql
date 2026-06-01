-- ============================================================
-- SIPMS FIX: Make application_id nullable on interviews and
--            quiz_attempts tables.
--
-- ROOT CAUSE:
--   The Java entities (Interview.java, QuizAttempt.java) define
--   application_id as optional (no nullable=false), but the DB
--   column was created as NOT NULL in an older schema version.
--   Hibernate ddl-auto=update never relaxes NOT NULL constraints,
--   so the mismatch causes SQL Error 1048 (500 Internal Server Error)
--   whenever an interview or quiz attempt is created without an
--   associated application.
--
-- Run this script once against your sipms_db database.
-- ============================================================

USE sipms_db;

-- Fix 1: interviews.application_id
ALTER TABLE interviews
    MODIFY COLUMN application_id BIGINT NULL;

-- Fix 2: quiz_attempts.application_id
--   (same problem, same fix)
ALTER TABLE quiz_attempts
    MODIFY COLUMN application_id BIGINT NULL;

-- Verify the changes
SELECT TABLE_NAME, COLUMN_NAME, IS_NULLABLE, COLUMN_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'sipms_db'
  AND TABLE_NAME   IN ('interviews', 'quiz_attempts')
  AND COLUMN_NAME  = 'application_id';
