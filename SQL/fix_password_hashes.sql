-- Fix password hash for all users to "Admin@123"
-- The correct BCrypt hash for "Admin@123" is:
-- $2a$10$SlAUU8UlvNAqVZHMsb2OBuOq5gAJlrMAMnXQkqrXQxJKJH0gMz2OW

UPDATE users SET password_hash = '$2a$10$SlAUU8UlvNAqVZHMsb2OBuOq5gAJlrMAMnXQkqrXQxJKJH0gMz2OW' 
WHERE email IN ('admin@sipms.com', 'manager@sipms.com', 'receptionist@sipms.com', 'test@candidate.com');

-- Verify the update
SELECT id, email, first_name, last_name, active, password_hash 
FROM users 
WHERE email IN ('admin@sipms.com', 'manager@sipms.com', 'receptionist@sipms.com', 'test@candidate.com');
