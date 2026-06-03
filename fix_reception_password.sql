-- Reset all seed account passwords to Admin@123
-- BCrypt hash of "Admin@123" with strength 10
UPDATE users 
SET password_hash = '$2a$10$N.zmdr9zkzoGtLkeyBfYq.GZjzFHoYTX9M0WMBREBUiA9iGWMNIxW',
    active = 1,
    must_change_password = 0
WHERE email IN ('admin@sipms.com', 'manager@sipms.com', 'reception@sipms.com', 'candidate@test.com');

-- Verify the fix
SELECT email, active, must_change_password, password_hash FROM users 
WHERE email IN ('admin@sipms.com', 'manager@sipms.com', 'reception@sipms.com', 'candidate@test.com');
