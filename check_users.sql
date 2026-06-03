-- Check all users in the database
SELECT id, email, first_name, last_name, active, password_hash, active 
FROM users 
WHERE email LIKE '%sipms%' OR email LIKE '%test%';

-- Also check the exact emails we're looking for
SELECT COUNT(*) as reception_count FROM users WHERE email = 'reception@sipms.com';
SELECT COUNT(*) as admin_count FROM users WHERE email = 'admin@sipms.com';
SELECT COUNT(*) as manager_count FROM users WHERE email = 'manager@sipms.com';
SELECT COUNT(*) as candidate_count FROM users WHERE email = 'candidate@test.com';
