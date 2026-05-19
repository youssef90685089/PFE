-- ============================================
-- SIPMS MYSQL SETUP
-- ============================================

-- 1. Create roles
INSERT IGNORE INTO roles (name) VALUES 
('ROLE_ADMIN'), ('ROLE_MANAGER'), ('ROLE_RECEPTIONIST'), ('ROLE_CANDIDATE');

-- 2. Create users (skip if already exists)
INSERT IGNORE INTO users (first_name, last_name, email, active, created_at) VALUES 
('System', 'Administrator', 'admin@sipms.com', 1, NOW()),
('Manager', 'User', 'manager@sipms.com', 1, NOW()),
('Reception', 'Desk', 'reception@sipms.com', 1, NOW()),
('Test', 'Candidate', 'candidate@test.com', 1, NOW());

-- 3. Assign roles (use proper IDs)
-- Admin
INSERT IGNORE INTO user_roles (user_id, role_id) 
SELECT (SELECT id FROM users WHERE email='admin@sipms.com'), 
(SELECT id FROM roles WHERE name='ROLE_ADMIN');

-- Manager
INSERT IGNORE INTO user_roles (user_id, role_id) 
SELECT (SELECT id FROM users WHERE email='manager@sipms.com'), 
(SELECT id FROM roles WHERE name='ROLE_MANAGER');

-- Receptionist
INSERT IGNORE INTO user_roles (user_id, role_id) 
SELECT (SELECT id FROM users WHERE email='reception@sipms.com'), 
(SELECT id FROM roles WHERE name='ROLE_RECEPTIONIST');

-- Candidate
INSERT IGNORE INTO user_roles (user_id, role_id) 
SELECT (SELECT id FROM users WHERE email='candidate@test.com'), 
(SELECT id FROM roles WHERE name='ROLE_CANDIDATE');

-- 4. Set password BCrypt("Admin@123")
UPDATE users SET password_hash='$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7pV7bDyP3f7.pVxV8Q6W6K2S'
WHERE email IN ('admin@sipms.com','manager@sipms.com','reception@sipms.com','candidate@test.com');

-- 5. Verify
SELECT u.email, r.name as role FROM users u 
JOIN user_roles ur ON u.id=ur.user_id 
JOIN roles r ON ur.role_id=r.id 
WHERE u.email LIKE '%@sipms.com' OR u.email='candidate@test.com';

-- ============================================
-- LOGIN: admin@sipms.com / Admin@123
-- ============================================