# Install Supabase CLI if not already installed
winget install supabase.cli

# Login to Supabase (you'll need to run this once)
supabase login

# Link to your Supabase project
supabase link --project-ref iqekgptnsqfkafjjwdon

# Deploy the function
supabase functions deploy send-approval-email --project-ref iqekgptnsqfkafjjwdon

# Set the environment variables
supabase secrets set --env-file .env 