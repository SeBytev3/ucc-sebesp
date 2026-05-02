-- @name getUsersByRole
SELECT id, email, first_name, last_name, role
FROM users
WHERE role::text = $1;
