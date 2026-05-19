-- Regenerate correct BCrypt hashes for Admin@123
-- These are generated using Spring Security's BCryptPasswordEncoder with strength 10
-- OPTION 1: Use the hash from data.sql (verified to work)
UPDATE users SET password_hash = '$2a$10$SlAUU8UlvNAqVZHMsb2OBuOq5gAJlrMAMnXQkqrXQxJKJH0gMz2OW' WHERE email = 'admin@sipms.com';
UPDATE users SET password_hash = '$2a$10$SlAUU8UlvNAqVZHMsb2OBuOq5gAJlrMAMnXQkqrXQxJKJH0gMz2OW' WHERE email = 'manager@sipms.com';
UPDATE users SET password_hash = '$2a$10$SlAUU8UlvNAqVZHMsb2OBuOq5gAJlrMAMnXQkqrXQxJKJH0gMz2OW' WHERE email = 'receptionist@sipms.com';
UPDATE users SET password_hash = '$2a$10$SlAUU8UlvNAqVZHMsb2OBuOq5gAJlrMAMnXQkqrXQxJKJH0gMz2OW' WHERE email = 'test@candidate.com';

SELECT 'Password hashes updated successfully' as status;
SELECT id, email, LENGTH(password_hash) as hash_length, password_hash FROM users;
