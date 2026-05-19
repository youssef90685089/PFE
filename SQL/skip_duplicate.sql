-- ============================================
-- SKIP IF DUPLICATE - JUST VERIFY
-- ============================================

-- Option 1: Check if user has role
SELECT u.email, r.name as role
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
WHERE u.email = 'admin@sipms.com';

-- Option 2: Update role if needed (change IDs)
-- UPDATE user_roles SET role_id = 1 WHERE user_id = 16;

-- Option 3: Test login directly in backend
-- The system should work. Just restart backend and try login.