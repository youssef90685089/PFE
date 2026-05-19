-- ============================================
-- SIPMS - SIMPLE FIX
-- ============================================

INSERT IGNORE INTO roles (name) VALUES ('ROLE_ADMIN');
INSERT IGNORE INTO roles (name) VALUES ('ROLE_MANAGER');

INSERT IGNORE INTO users (first_name, last_name, email, password_hash, active) VALUES 
('Admin', 'User', 'admin@sipms.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7pV7bDyP3f7.pVxV8Q6W6K2S', 1);

-- Get IDs
SELECT id, email FROM users WHERE email = 'admin@sipms.com';
SELECT id, name FROM roles;

-- Assign role (use your IDs)
INSERT INTO user_roles (user_id, role_id) VALUES (YOUR_USER_ID, YOUR_ROLE_ID);