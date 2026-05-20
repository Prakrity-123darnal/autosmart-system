-- Option A: Create default admin (run in pgAdmin / DBeaver on database "autosmart")
-- Skip if you already have this email.

INSERT INTO "Users" ("Name", "Email", "Password", "Phone", "Role", "CreatedAt")
SELECT
  'System Admin',
  'admin@autosmart.com',
  'admin123',
  '9800000000',
  'admin',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM "Users" WHERE LOWER("Email") = 'admin@autosmart.com'
);
