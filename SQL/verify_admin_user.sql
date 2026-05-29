-- Verify admin user configuration
SELECT 'Checking admin user...' as check_type;
SELECT * FROM users WHERE email = 'admin@sipms.com';

SELECT 'Checking admin user roles...' as check_type;
SELECT u.id, u.email, r.name as role 
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
WHERE u.email = 'admin@sipms.com';

SELECT 'Verifying password hash...' as check_type;
SELECT id, email, password_hash, active, created_at FROM users WHERE email = 'admin@sipms.com';

SELECT 'Expected hash for "Admin@123": $2a$10$SlAUU8UlvNAqVZHMsb2OBuOq5gAJlrMAMnXQkqrXQxJKJH0gMz2OW' as expected_hash;
