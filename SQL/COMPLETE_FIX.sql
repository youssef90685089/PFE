-- ============================================
-- SIPMS DATABASE FIX - COMPLETE
-- ============================================

-- Run this in MySQL Workbench (each statement separated by semicolon)

-- ============================================
-- STEP 1: CREATE ROLES
-- ============================================
INSERT IGNORE INTO roles (name) VALUES ('ROLE_ADMIN');
INSERT IGNORE INTO roles (name) VALUES ('ROLE_MANAGER');
INSERT IGNORE INTO roles (name) VALUES ('ROLE_RECEPTIONIST');
INSERT IGNORE INTO roles (name) VALUES ('ROLE_CANDIDATE');

-- ============================================
-- STEP 2: CREATE USERS
-- ============================================
INSERT IGNORE INTO users (first_name, last_name, email, password_hash, active) VALUES 
('Admin', 'System', 'admin@sipms.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7pV7bDyP3f7.pVxV8Q6W6K2S', 1);

INSERT IGNORE INTO users (first_name, last_name, email, password_hash, active) VALUES 
('Manager', 'User', 'manager@sipms.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7pV7bDyP3f7.pVxV8Q6W6K2S', 1);

INSERT IGNORE INTO users (first_name, last_name, email, password_hash, active) VALUES 
('Reception', 'Desk', 'reception@sipms.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7pV7bDyP3f7.pVxV8Q6W6K2S', 1);

INSERT IGNORE INTO users (first_name, last_name, email, password_hash, active) VALUES 
('Test', 'Candidate', 'candidate@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7pV7bDyP3f7.pVxV8Q6W6K2S', 1);

-- ============================================
-- STEP 3: ASSIGN ROLES
-- ============================================
-- admin@sipms.com -> ROLE_ADMIN
INSERT INTO user_roles (user_id, role_id) 
SELECT u.id, r.id FROM users u, roles r 
WHERE u.email = 'admin@sipms.com' AND r.name = 'ROLE_ADMIN';

-- manager@sipms.com -> ROLE_MANAGER
INSERT INTO user_roles (user_id, role_id) 
SELECT u.id, r.id FROM users u, roles r 
WHERE u.email = 'manager@sipms.com' AND r.name = 'ROLE_MANAGER';

-- reception@sipms.com -> ROLE_RECEPTIONIST
INSERT INTO user_roles (user_id, role_id) 
SELECT u.id, r.id FROM users u, roles r 
WHERE u.email = 'reception@sipms.com' AND r.name = 'ROLE_RECEPTIONIST';

-- candidate@test.com -> ROLE_CANDIDATE
INSERT INTO user_roles (user_id, role_id) 
SELECT u.id, r.id FROM users u, roles r 
WHERE u.email = 'candidate@test.com' AND r.name = 'ROLE_CANDIDATE';

-- ============================================
-- STEP 4: VERIFY
-- ============================================
SELECT u.email, r.name as role, u.active 
FROM users u 
LEFT JOIN user_roles ur ON u.id = ur.user_id 
LEFT JOIN roles r ON ur.role_id = r.id;

-- ============================================
-- LOGIN CREDENTIALS:
-- Email: admin@sipms.com
-- Password: Admin@123
-- ============================================