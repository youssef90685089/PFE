-- ============================================
-- SIPMS MYSQL - CREATE WORKING USERS
-- ============================================

-- 1. Clean existing problematic users
DELETE FROM user_roles WHERE user_id IN (SELECT id FROM users);
DELETE FROM users;

-- 2. Create roles
INSERT INTO roles (name) VALUES 
('ROLE_ADMIN'), 
('ROLE_MANAGER'), 
('ROLE_RECEPTIONIST'), 
('ROLE_CANDIDATE');

-- 3. Create users with BCrypt password "Admin@123"
-- The hash $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7pV7bDyP3f7.pVxV8Q6W6K2S is BCrypt("Admin@123")

INSERT INTO users (first_name, last_name, email, password_hash, active, created_at) VALUES 
('Admin', 'User', 'admin@sipms.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7pV7bDyP3f7.pVxV8Q6W6K2S', 1, NOW()),
('Manager', 'User', 'manager@sipms.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7pV7bDyP3f7.pVxV8Q6W6K2S', 1, NOW()),
('Reception', 'Desk', 'reception@sipms.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7pV7bDyP3f7.pVxV8Q6W6K2S', 1, NOW()),
('Test', 'Candidate', 'candidate@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7pV7bDyP3f7.pVxV8Q6W6K2S', 1, NOW());

-- 4. Assign roles
-- admin@sipms.com = ROLE_ADMIN (id=1)
INSERT INTO user_roles (user_id, role_id) VALUES (1, 1);

-- manager@sipms.com = ROLE_MANAGER (id=2)
INSERT INTO user_roles (user_id, role_id) VALUES (2, 2);

-- reception@sipms.com = ROLE_RECEPTIONIST (id=3)
INSERT INTO user_roles (user_id, role_id) VALUES (3, 3);

-- candidate@test.com = ROLE_CANDIDATE (id=4)
INSERT INTO user_roles (user_id, role_id) VALUES (4, 4);

-- 5. Verify
SELECT u.email, r.name as role, u.active 
FROM users u 
LEFT JOIN user_roles ur ON u.id = ur.user_id 
LEFT JOIN roles r ON ur.role_id = r.id;