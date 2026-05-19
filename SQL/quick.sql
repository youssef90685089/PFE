-- SIPMS FIX - Run exactly as shown:

-- 1. Add roles
INSERT IGNORE INTO roles (name) VALUES ('ROLE_ADMIN');
INSERT IGNORE INTO roles (name) VALUES ('ROLE_MANAGER');

-- 2. Add admin user
INSERT IGNORE INTO users (first_name, last_name, email, password_hash, active) VALUES 
('Admin', 'System', 'admin@sipms.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7pV7bDyP3f7.pVxV8Q6W6K2S', 1);

-- 3. Check IDs - write them down
SELECT id, email FROM users WHERE email = 'admin@sipms.com';
SELECT id, name FROM roles WHERE name = 'ROLE_ADMIN';

-- 4. Link them - REPLACE THE NUMBERS WITH YOUR ACTUAL IDs
INSERT INTO user_roles (user_id, role_id) VALUES (1, 1);

-- DONE - Login with: admin@sipms.com / Admin@123