-- SIMPLE FIX - Run each line separately in MySQL

-- Step 1: Create roles
INSERT IGNORE INTO roles (name) VALUES ('ROLE_ADMIN');
INSERT IGNORE INTO roles (name) VALUES ('ROLE_MANAGER');

-- Step 2: Create admin user
INSERT IGNORE INTO users (first_name, last_name, email, password_hash, active) VALUES 
('Admin', 'System', 'admin@sipms.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7pV7bDyP3f7.pVxV8Q6W6K2S', 1);

-- Step 3: Get the IDs (write these down)
SELECT id, email FROM users;
SELECT id, name FROM roles;

-- Step 4: Assign role (replace IDs)
-- Example: INSERT INTO user_roles (user_id, role_id) VALUES (1, 1);