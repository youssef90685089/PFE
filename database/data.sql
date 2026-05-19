-- ============================================================
-- CLINISYS — PRODUCTION SEED DATA
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- Clear existing data
TRUNCATE TABLE user_roles;
TRUNCATE TABLE notifications;
TRUNCATE TABLE quiz_answers;
TRUNCATE TABLE quiz_attempts;
TRUNCATE TABLE quiz_questions;
TRUNCATE TABLE quizzes;
TRUNCATE TABLE ai_rankings;
TRUNCATE TABLE audit_logs;
TRUNCATE TABLE documents;
TRUNCATE TABLE applications;
TRUNCATE TABLE projects;
TRUNCATE TABLE supervisors;
TRUNCATE TABLE candidates;
TRUNCATE TABLE users;
TRUNCATE TABLE roles;

SET FOREIGN_KEY_CHECKS = 1;

-- 1. Insert Roles
INSERT INTO `roles` (`id`, `name`) VALUES
(1, 'ROLE_ADMIN'),
(2, 'ROLE_MANAGER'),
(3, 'ROLE_RECEPTIONIST'),
(4, 'ROLE_CANDIDATE');

-- 2. Insert Users with password "Admin@123"
-- BCrypt hash generated with cost 10: echo -n 'Admin@123' | bcrypt -c 10
-- Hash: $2a$10$SlAUU8UlvNAqVZHMsb2OBuOq5gAJlrMAMnXQkqrXQxJKJH0gMz2OW
INSERT INTO `users` (`id`, `first_name`, `last_name`, `email`, `password_hash`, `phone`, `active`, `created_at`, `updated_at`) VALUES
(1, 'System', 'Administrator', 'admin@sipms.com', '$2a$10$SlAUU8UlvNAqVZHMsb2OBuOq5gAJlrMAMnXQkqrXQxJKJH0gMz2OW', '1234567890', TRUE, NOW(), NOW()),
(2, 'Project', 'Manager', 'manager@sipms.com', '$2a$10$SlAUU8UlvNAqVZHMsb2OBuOq5gAJlrMAMnXQkqrXQxJKJH0gMz2OW', '1234567891', TRUE, NOW(), NOW()),
(3, 'Front', 'Desk', 'reception@sipms.com', '$2a$10$SlAUU8UlvNAqVZHMsb2OBuOq5gAJlrMAMnXQkqrXQxJKJH0gMz2OW', '1234567892', TRUE, NOW(), NOW()),
(4, 'Test', 'Candidate', 'candidate@test.com', '$2a$10$SlAUU8UlvNAqVZHMsb2OBuOq5gAJlrMAMnXQkqrXQxJKJH0gMz2OW', '1234567893', TRUE, NOW(), NOW());

-- 3. Assign Roles
INSERT INTO `user_roles` (`user_id`, `role_id`) VALUES
(1, 1),  -- admin has ROLE_ADMIN
(2, 2),  -- manager has ROLE_MANAGER
(3, 3),  -- receptionist has ROLE_RECEPTIONIST
(4, 4);  -- test has ROLE_CANDIDATE

-- 4. Create Candidates for users 4
INSERT INTO `candidates` (`id`, `user_id`, `university`, `degree`, `graduation_year`, `skills_tags`, `bio`, `created_at`, `updated_at`) VALUES
(1, 4, 'IIT Sfax', 'Computer Science', 2026, 'Java,Python,React', 'Test candidate', NOW(), NOW());

-- Show created data
SELECT 'Users created:' as status;
SELECT id, email, first_name, last_name, active FROM users;
SELECT 'Roles assigned:' as status;
SELECT * FROM user_roles;
SELECT 'Password for all users: Admin@123' as info;