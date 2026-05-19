-- ============================================
-- SIPMS - QUICK FIX
-- ============================================

-- 1. Create roles if not exist
INSERT IGNORE INTO roles (name) VALUES ('ROLE_ADMIN');
INSERT IGNORE INTO roles (name) VALUES ('ROLE_MANAGER');
INSERT IGNORE INTO roles (name) VALUES ('ROLE_RECEPTIONIST');
INSERT IGNORE INTO roles (name) VALUES ('ROLE_CANDIDATE');

-- 2. Create users (password: Admin@123)
INSERT IGNORE INTO users (first_name, last_name, email, password_hash, active) VALUES 
('Admin', 'User', 'admin@sipms.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7pV7bDyP3f7.pVxV8Q6W6K2S', 1);

INSERT IGNORE INTO users (first_name, last_name, email, password_hash, active) VALUES 
('Manager', 'User', 'manager@sipms.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7pV7bDyP3f7.pVxV8Q6W6K2S', 1);

-- 3. Get user and role IDs
SELECT id, email FROM users;
SELECT id, name FROM roles;

-- 4. Assign roles (replace 1,2 with actual IDs from step 3)
-- Run: INSERT INTO user_roles (user_id, role_id) VALUES (USER_ID, ROLE_ID);