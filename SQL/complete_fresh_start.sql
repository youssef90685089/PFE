-- ============================================
-- SIPMS COMPLETE FRESH START
-- ============================================

-- 1. SHOW ALL TABLES
SHOW TABLES;

-- 2. CHECK USERS TABLE STRUCTURE
DESCRIBE users;

-- 3. CHECK ROLES TABLE STRUCTURE  
DESCRIBE roles;

-- 4. CHECK USER_ROLES TABLE STRUCTURE
DESCRIBE user_roles;

-- 5. DELETE ALL EXISTING DATA
DELETE FROM user_roles;
DELETE FROM users;
DELETE FROM roles;

-- 6. INSERT FRESH ROLES
INSERT INTO roles (id, name) VALUES (1, 'ROLE_ADMIN');
INSERT INTO roles (id, name) VALUES (2, 'ROLE_MANAGER');
INSERT INTO roles (id, name) VALUES (3, 'ROLE_RECEPTIONIST');
INSERT INTO roles (id, name) VALUES (4, 'ROLE_CANDIDATE');

-- 7. INSERT FRESH USERS (BCrypt hash for "Admin@123")
INSERT INTO users (id, first_name, last_name, email, password_hash, active, created_at) VALUES 
(1, 'Admin', 'System', 'admin@sipms.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7pV7bDyP3f7.pVxV8Q6W6K2S', 1, NOW());

INSERT INTO users (id, first_name, last_name, email, password_hash, active, created_at) VALUES 
(2, 'Manager', 'User', 'manager@sipms.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7pV7bDyP3f7.pVxV8Q6W6K2S', 1, NOW());

INSERT INTO users (id, first_name, last_name, email, password_hash, active, created_at) VALUES 
(3, 'Reception', 'Desk', 'reception@sipms.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7pV7bDyP3f7.pVxV8Q6W6K2S', 1, NOW());

INSERT INTO users (id, first_name, last_name, email, password_hash, active, created_at) VALUES 
(4, 'Test', 'Candidate', 'candidate@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7pV7bDyP3f7.pVxV8Q6W6K2S', 1, NOW());

-- 8. INSERT FRESH USER_ROLES
INSERT INTO user_roles (user_id, role_id) VALUES (1, 1);
INSERT INTO user_roles (user_id, role_id) VALUES (2, 2);
INSERT INTO user_roles (user_id, role_id) VALUES (3, 3);
INSERT INTO user_roles (user_id, role_id) VALUES (4, 4);

-- 9. VERIFY
SELECT u.id, u.email, r.name as role
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id;

-- RESULT SHOULD SHOW:
-- 1 | admin@sipms.com | ROLE_ADMIN
-- 2 | manager@sipms.com | ROLE_MANAGER
-- 3 | reception@sipms.com | ROLE_RECEPTIONIST
-- 4 | candidate@test.com | ROLE_CANDIDATE