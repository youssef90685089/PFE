-- ============================================
-- SIPMS - CREATE WORKING USERS (SAFE VERSION)
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Clean existing users
DELETE FROM users WHERE email IN ('admin@sipms.com', 'manager@sipms.com', 'reception@sipms.com', 'candidate@test.com');

-- 2. Create roles (only if not exist)
INSERT IGNORE INTO roles (name) VALUES ('ROLE_ADMIN');
INSERT IGNORE INTO roles (name) VALUES ('ROLE_MANAGER');
INSERT IGNORE INTO roles (name) VALUES ('ROLE_RECEPTIONIST');
INSERT IGNORE INTO roles (name) VALUES ('ROLE_CANDIDATE');

-- 3. Create users (password: Admin@123)
INSERT INTO users (first_name, last_name, email, password_hash, active, created_at) VALUES 
('Admin', 'User', 'admin@sipms.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7pV7bDyP3f7.pVxV8Q6W6K2S', 1, NOW());

INSERT INTO users (first_name, last_name, email, password_hash, active, created_at) VALUES 
('Manager', 'User', 'manager@sipms.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7pV7bDyP3f7.pVxV8Q6W6K2S', 1, NOW());

INSERT INTO users (first_name, last_name, email, password_hash, active, created_at) VALUES 
('Reception', 'Desk', 'reception@sipms.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7pV7bDyP3f7.pVxV8Q6W6K2S', 1, NOW());

INSERT INTO users (first_name, last_name, email, password_hash, active, created_at) VALUES 
('Test', 'Candidate', 'candidate@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7pV7bDyP3f7.pVxV8Q6W6K2S', 1, NOW());

-- 4. Assign roles (delete old, then insert new)
DELETE FROM user_roles WHERE user_id IN (SELECT id FROM users WHERE email IN ('admin@sipms.com', 'manager@sipms.com', 'reception@sipms.com', 'candidate@test.com'));

INSERT INTO user_roles (user_id, role_id) 
SELECT u.id, r.id FROM users u, roles r 
WHERE u.email = 'admin@sipms.com' AND r.name = 'ROLE_ADMIN';

INSERT INTO user_roles (user_id, role_id) 
SELECT u.id, r.id FROM users u, roles r 
WHERE u.email = 'manager@sipms.com' AND r.name = 'ROLE_MANAGER';

INSERT INTO user_roles (user_id, role_id) 
SELECT u.id, r.id FROM users u, roles r 
WHERE u.email = 'reception@sipms.com' AND r.name = 'ROLE_RECEPTIONIST';

INSERT INTO user_roles (user_id, role_id) 
SELECT u.id, r.id FROM users u, roles r 
WHERE u.email = 'candidate@test.com' AND r.name = 'ROLE_CANDIDATE';

SET FOREIGN_KEY_CHECKS = 1;

-- 5. Verify
SELECT u.email, r.name as role FROM users u 
JOIN user_roles ur ON u.id = ur.user_id 
JOIN roles r ON ur.role_id = r.id;