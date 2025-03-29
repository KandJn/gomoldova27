# GoMoldova

A ride-sharing and bus booking platform for Moldova.

## Deploying to Netlify

### Option 1: Deploy with Netlify UI

1. Log in to your Netlify account (or create one at [netlify.com](https://netlify.com))
2. Click "Add new site" and select "Import an existing project"
3. Connect to your Git provider and select this repository
4. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Add the following environment variables in "Site settings" > "Environment variables":
   ```
   VITE_SUPABASE_URL=https://iqekgptnsqfkafjjwdon.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxZWtncHRuc3Fma2Fmamp3ZG9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkzOTk1NzcsImV4cCI6MjA1NDk3NTU3N30.WSyQr11R57hmWcS3-v_bDhpNUenixIl2xh7D9xD6-L0
   VITE_GOOGLE_MAPS_API_KEY=AIzaSyA8Tt958ELGpKYWlS6VT0OYzLHgJ0ljzSk
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=gomoldova.contact@gmail.com
   SMTP_PASS=mraf ufnr zchn inib
   SMTP_FROM=GoMoldova <gomoldova.contact@gmail.com>
   ```
6. Click "Deploy site"

### Option 2: Deploy with Netlify CLI

1. Install the Netlify CLI:
   ```
   npm install netlify-cli --save-dev
   ```

2. Login to your Netlify account:
   ```
   npx netlify login
   ```

3. Initialize Netlify for this project:
   ```
   npx netlify init
   ```
   - Select "Create & configure a new site"
   - Choose your team
   - Enter a site name (or leave blank for a random name)

4. Set up your environment variables:
   ```
   npx netlify env:import .env
   ```

5. Deploy your site:
   ```
   npx netlify deploy --prod
   ```

## Using Netlify for Contact/Email Functions

This project uses Netlify Functions to handle email sending. The email function is located in:
`netlify/functions/send-email/send-email.js`

The environment variables for SMTP must be set in your Netlify dashboard for emails to work properly.

## Development

1. Install dependencies:
   ```
   npm install
   ```

2. Start development server:
   ```
   npm run dev
   ```

3. Build for production:
   ```
   npm run build
   ```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SMTP_FROM=your_from_email
```

## Setup Instructions

### Database Setup

To set up the required database tables, follow these steps:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Create the bus_companies table by running the following SQL:

```sql
-- Create bus_companies table
CREATE TABLE IF NOT EXISTS bus_companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  company_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  user_id UUID REFERENCES auth.users(id)
);

-- Create RLS policies
ALTER TABLE bus_companies ENABLE ROW LEVEL SECURITY;

-- Policy for admins (can do everything)
CREATE POLICY "Admins can do everything" ON bus_companies
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Policy for public read of approved companies
CREATE POLICY "Anyone can view approved companies" ON bus_companies
  FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

-- Policy for bus companies to view their own data
CREATE POLICY "Bus companies can view their own data" ON bus_companies
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_bus_companies_status ON bus_companies(status);
CREATE INDEX IF NOT EXISTS idx_bus_companies_email ON bus_companies(email);
```

### CORS Configuration

To allow your local development server to connect to Supabase:

1. Go to your Supabase project dashboard
2. Navigate to Project Settings > API
3. Under "API Settings", find the CORS section
4. Add your local development URL (e.g., `http://localhost:5173`, `http://localhost:5174`, etc.)
5. Click Save

### Environment Variables

Create a `.env` file in the root of your project with the following variables:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Email Configuration
SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
SMTP_FROM=your_from_email
NEXT_PUBLIC_SITE_URL=your_site_url
```

### Running the Application

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```