-- ============================================
-- FIX: ADD MISSING COLUMNS TO USERS TABLE
-- ============================================

-- Check if columns exist first
SHOW COLUMNS FROM users LIKE 'specialty';

-- Add columns if they don't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS specialty VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS status ENUM('pending_quiz', 'quiz_completed', 'quiz_failed', 'interview_scheduled', 'hired', 'rejected') DEFAULT 'pending_quiz';
ALTER TABLE users ADD COLUMN IF NOT EXISTS quiz_created_at DATETIME;
ALTER TABLE users ADD COLUMN IF NOT EXISTS quiz_completed_at DATETIME;
ALTER TABLE users ADD COLUMN IF NOT EXISTS quiz_score INT;

-- Check again
SHOW COLUMNS FROM users LIKE 'specialty';

-- Run the query again
SELECT specialty, COUNT(*) as total, 
       SUM(CASE WHEN status = 'pending_quiz' THEN 1 ELSE 0 END) as pending,
       SUM(CASE WHEN status = 'quiz_completed' THEN 1 ELSE 0 END) as completed
FROM users 
WHERE roles LIKE '%CANDIDATE%'
GROUP BY specialty;