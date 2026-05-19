-- ============================================
-- SIPMS - FINAL FIX (SAFE VERSION)
-- ============================================

-- DISABLE SAFE MODE
SET SQL_SAFE_UPDATES = 0;

-- 1. DELETE ALL DATA
DELETE FROM user_roles;
DELETE FROM users;
DELETE FROM roles;

-- ENABLE SAFE MODE
SET SQL_SAFE_UPDATES = 1;

-- 2. CREATE ROLES (if not exist)
INSERT IGNORE INTO roles (id, name) VALUES (1, 'ROLE_ADMIN');
INSERT IGNORE INTO roles (id, name) VALUES (2, 'ROLE_MANAGER');
INSERT IGNORE INTO roles (id, name) VALUES (3, 'ROLE_RECEPTIONIST');
INSERT IGNORE INTO roles (id, name) VALUES (4, 'ROLE_CANDIDATE');

-- 3. CREATE USERS
INSERT IGNORE INTO users (id, first_name, last_name, email, password_hash, active, created_at) VALUES 
(1, 'Admin', 'System', 'admin@sipms.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7pV7bDyP3f7.pVxV8Q6W6K2S', 1, NOW());

INSERT IGNORE INTO users (id, first_name, last_name, email, password_hash, active, created_at) VALUES 
(2, 'Manager', 'User', 'manager@sipms.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7pV7bDyP3f7.pVxV8Q6W6K2S', 1, NOW());

INSERT IGNORE INTO users (id, first_name, last_name, email, password_hash, active, created_at) VALUES 
(3, 'Reception', 'Desk', 'reception@sipms.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7pV7bDyP3f7.pVxV8Q6W6K2S', 1, NOW());

INSERT IGNORE INTO users (id, first_name, last_name, email, password_hash, active, created_at) VALUES 
(4, 'Test', 'Candidate', 'candidate@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7pV7bDyP3f7.pVxV8Q6W6K2S', 1, NOW());

-- 4. DELETE OLD user_roles (if any duplicate)
DELETE FROM user_roles WHERE user_id IN (1,2,3,4);

-- 5. INSERT NEW user_roles
INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (1, 1);
INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (2, 2);
INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (3, 3);
INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (4, 4);

-- 6. CHECK RESULT
SELECT u.id, u.email, r.name as role
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id;

-- ============================================
-- LOGIN: admin@sipms.com / Admin@123
-- ============================================