-- ============================================
-- SIPMS - CHECK USER STATUS
-- ============================================

-- Check user exists and role
SELECT u.id, u.email, u.active, u.password_hash, r.name as role
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
WHERE u.email = 'admin@sipms.com';

-- Test password hash (Admin@123)
-- If wrong, update password:
-- UPDATE users SET password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7pV7bDyP3f7.pVxV8Q6W6K2S'
-- WHERE email = 'admin@sipms.com';