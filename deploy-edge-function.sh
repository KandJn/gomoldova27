#!/bin/bash

# Deploy the send-approval-email Edge Function to Supabase

echo "Deploying send-approval-email Edge Function..."

# Set environment variables for the function
echo "Setting environment variables..."
supabase secrets set SMTP_HOST="$SMTP_HOST"
supabase secrets set SMTP_PORT="$SMTP_PORT"
supabase secrets set SMTP_USER="$SMTP_USER"
supabase secrets set SMTP_PASS="$SMTP_PASS"
supabase secrets set SMTP_FROM="$SMTP_FROM"
supabase secrets set NEXT_PUBLIC_SITE_URL="$NEXT_PUBLIC_SITE_URL"

# Deploy the function
echo "Deploying function..."
supabase functions deploy send-approval-email

echo "Deployment complete!" 