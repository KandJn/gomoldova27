-- Update email verification link expiry time to 15 minutes
UPDATE auth.config
SET value = '900'
WHERE key = 'email_confirmation_expiry';

-- Update the email template to reflect the new expiry time
UPDATE auth.email_templates
SET content = replace(
  content,
  'This link will expire in 1 hour',
  'This link will expire in 15 minutes'
)
WHERE name = 'confirm_signup';

-- Note: The email confirmation expiry time (15 minutes) should be configured in the Supabase Dashboard:
-- 1. Go to Authentication > Email Templates
-- 2. Click on "Confirm signup" template
-- 3. Set "Link expiry time" to 15 minutes

-- Note: The following changes need to be made in the Supabase Dashboard:

-- 1. Set Email Confirmation Link Expiry:
--    - Go to Authentication > Email Templates
--    - Click on "Confirm signup" template
--    - Set "Link expiry time" to 15 minutes

-- 2. Update Email Template Content:
--    - In the same "Confirm signup" template
--    - Update the content to mention "15 minutes" instead of "1 hour"
--    - The template should include a note about the 15-minute expiry time 