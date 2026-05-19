-- ============================================
-- SIPMS - CHECK & FIX
-- ============================================

-- Step 1: Check existing users
SELECT u.id, u.email, u.active, r.name as role
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id;

-- Step 2: If no role, assign (change IDs as needed)
UPDATE user_roles ur
SET ur.role_id = 1
WHERE ur.user_id = (SELECT id FROM users WHERE email = 'admin@sipms.com');

-- OR delete and recreate
-- DELETE FROM user_roles WHERE user_id = (SELECT id FROM users WHERE email = 'admin@sipms.com');
-- INSERT INTO user_roles (user_id, role_id) VALUES (USER_ID, ROLE_ID);