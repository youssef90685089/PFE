-- ============================================================
-- SIPMS Authentication Setup Verification Script
-- Run this to verify admin user exists with correct password hash
-- ============================================================

-- 1. Check if roles exist
SELECT 'Step 1: Verify Roles Exist' as status;
SELECT * FROM roles;

-- 2. Check admin user
SELECT 'Step 2: Verify Admin User Exists' as status;
SELECT id, email, first_name, last_name, active, password_hash FROM users WHERE email = 'admin@sipms.com';

-- 3. Check admin user roles
SELECT 'Step 3: Verify Admin User Has Roles' as status;
SELECT u.id, u.email, r.name 
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
WHERE u.email = 'admin@sipms.com';

-- 4. List all users and their roles
SELECT 'Step 4: All Users and Roles' as status;
SELECT 
    u.id, 
    u.email, 
    u.first_name, 
    u.last_name,
    u.active,
    u.password_hash,
    GROUP_CONCAT(r.name SEPARATOR ',') as roles
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
GROUP BY u.id, u.email, u.first_name, u.last_name, u.active, u.password_hash;

-- 5. Count total users
SELECT 'Step 5: Total Users Count' as status;
SELECT COUNT(*) as total_users FROM users;

-- 6. Verify password hash for Admin@123
-- The BCrypt hash of "Admin@123" is: $2a$10$SlAUU8UlvNAqVZHMsb2OBuOq5gAJlrMAMnXQkqrXQxJKJH0gMz2OW
SELECT 'Step 6: Verify Password Hash' as status;
SELECT 
    'Expected: $2a$10$SlAUU8UlvNAqVZHMsb2OBuOq5gAJlrMAMnXQkqrXQxJKJH0gMz2OW' as expected_hash,
    password_hash as actual_hash,
    IF(password_hash = '$2a$10$SlAUU8UlvNAqVZHMsb2OBuOq5gAJlrMAMnXQkqrXQxJKJH0gMz2OW', 'MATCH ✓', 'MISMATCH ✗') as verification
FROM users 
WHERE email = 'admin@sipms.com';

-- 7. Check if all required users exist
SELECT 'Step 7: Required Test Users' as status;
SELECT 
    email,
    first_name,
    last_name,
    active,
    IF(password_hash = '$2a$10$SlAUU8UlvNAqVZHMsb2OBuOq5gAJlrMAMnXQkqrXQxJKJH0gMz2OW', 'Password OK ✓', 'Password Issue ✗') as password_status
FROM users 
WHERE email IN ('admin@sipms.com', 'manager@sipms.com', 'receptionist@sipms.com', 'test@candidate.com');
