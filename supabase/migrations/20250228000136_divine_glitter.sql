-- Add admin user by email\nWITH admin_user AS (\n  SELECT id \n  FROM auth.users \n  WHERE email = 'asassin.damian@gmail.com'\n)\nINSERT INTO admin_users (id, role, permissions)\nSELECT \n  id,\n  'super_admin',\n  '["all"]'::jsonb\nFROM admin_user\nON CONFLICT (id) DO UPDATE\nSET \n  role = 'super_admin',\n  permissions = '["all"]'::jsonb,\n  updated_at = now();
\n\n-- Grant necessary permissions\nCREATE POLICY "Admin can manage all verifications"\nON verifications FOR ALL TO authenticated\nUSING (\n  EXISTS (\n    SELECT 1 FROM admin_users\n    WHERE id = auth.uid()\n  )\n);
;
