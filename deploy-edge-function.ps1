# Deploy the send-approval-email Edge Function to Supabase

Write-Host "Deploying send-approval-email Edge Function..." -ForegroundColor Green

# Set environment variables for the function
Write-Host "Setting environment variables..." -ForegroundColor Yellow
supabase secrets set SMTP_HOST="$env:SMTP_HOST"
supabase secrets set SMTP_PORT="$env:SMTP_PORT"
supabase secrets set SMTP_USER="$env:SMTP_USER"
supabase secrets set SMTP_PASS="$env:SMTP_PASS"
supabase secrets set SMTP_FROM="$env:SMTP_FROM"
supabase secrets set NEXT_PUBLIC_SITE_URL="$env:NEXT_PUBLIC_SITE_URL"

# Deploy the function
Write-Host "Deploying function..." -ForegroundColor Yellow
supabase functions deploy send-approval-email

Write-Host "Deployment complete!" -ForegroundColor Green 