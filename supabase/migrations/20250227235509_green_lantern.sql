-- Add specific user as super admin\nINSERT INTO admin_users (id, role, permissions)\nVALUES (\n  '3f0499f6-f246-42b6-9a03-41c7857ffece',\n  'super_admin',\n  '["all"]'::jsonb\n)\nON CONFLICT (id) DO UPDATE\nSET \n  role = 'super_admin',\n  permissions = '["all"]'::jsonb,\n  updated_at = now();
\n\n-- Grant storage access to admin\nINSERT INTO storage.buckets (id, name, public)\nVALUES ('id-verifications', 'id-verifications', false)\nON CONFLICT (id) DO NOTHING;
\n\n-- Create policy for admin access to storage\nCREATE POLICY "Admins can access all verification documents"\nON storage.objects FOR ALL TO authenticated\nUSING (\n  bucket_id = 'id-verifications' AND\n  EXISTS (\n    SELECT 1 FROM admin_users\n    WHERE id = auth.uid()\n  )\n);
;
