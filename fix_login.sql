-- Fix password hashes for all test users to ensure they match "Admin@123"
-- Correct BCrypt hash for "Admin@123": $2a$10$SlAUU8UlvNAqVZHMsb2OBuOq5gAJlrMAMnXQkqrXQxJKJH0gMz2OW

UPDATE users SET password_hash = '$2a$10$SlAUU8UlvNAqVZHMsb2OBuOq5gAJlrMAMnXQkqrXQxJKJH0gMz2OW' 
WHERE email IN ('admin@sipms.com', 'manager@sipms.com', 'reception@sipms.com', 'candidate@test.com');

-- Verify the update
SELECT email, password_hash FROM users WHERE email IN ('admin@sipms.com', 'manager@sipms.com', 'reception@sipms.com', 'candidate@test.com');
