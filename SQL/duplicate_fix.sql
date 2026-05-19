-- ============================================
-- SIPMS - DUPLICATE FIX
-- ============================================

-- The role is already assigned. Just verify:

SELECT u.email, r.name as role
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE u.email = 'admin@sipms.com';

-- If no result, run this (change IDs):
-- DELETE FROM user_roles WHERE user_id = YOUR_USER_ID;
-- INSERT INTO user_roles (user_id, role_id) VALUES (YOUR_USER_ID, YOUR_ROLE_ID);