-- ============================================
-- SIPMS SIMPLE CHECK
-- ============================================

-- Check current status
SELECT u.email, r.name as role
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
WHERE u.email IN ('admin@sipms.com', 'manager@sipms.com', 'reception@sipms.com', 'candidate@test.com');