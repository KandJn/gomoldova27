-- Create bus company registrations table
create table if not exists bus_company_registrations (
  id bigint primary key generated always as identity,
  company_name text not null,
  registration_number text not null,
  vat_number text not null,
  address text not null,
  city text not null,
  country text not null,
  contact_person_name text not null,
  contact_person_email text not null,
  contact_person_phone text not null,
  number_of_vehicles integer not null,
  operating_routes text not null,
  website text,
  documents_url text,
  status text not null default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- Create admin notifications table
create table if not exists admin_notifications (
  id bigint primary key generated always as identity,
  type text not null,
  content text not null,
  company_registration_id text,
  status text not null default 'unread',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- Create storage bucket for company documents if it doesn't exist
insert into storage.buckets (id, name, public)
values ('company-documents', 'company-documents', false)
on conflict (id) do nothing;
-- Drop existing policies if they exist
do $$
begin
  -- Drop storage policies if they exist
  if exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
    and tablename = 'objects'
    and policyname = 'Allow public uploads'
  ) then
    drop policy if exists "Allow public uploads" on storage.objects;
  end if;

  if exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
    and tablename = 'objects'
    and policyname = 'Allow public reads'
  ) then
    drop policy if exists "Allow public reads" on storage.objects;
  end if;

  -- Drop bus_companies policies if they exist
  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
    and tablename = 'bus_companies'
    and policyname = 'Allow public read of bus companies'
  ) then
    drop policy if exists "Allow public read of bus companies" on bus_companies;
  end if;

  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
    and tablename = 'bus_companies'
    and policyname = 'Allow admins to manage bus companies'
  ) then
    drop policy if exists "Allow admins to manage bus companies" on bus_companies;
  end if;

  -- Drop password_reset_tokens policies if they exist
  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
    and tablename = 'password_reset_tokens'
    and policyname = 'Allow admins to manage password reset tokens'
  ) then
    drop policy if exists "Allow admins to manage password reset tokens" on password_reset_tokens;
  end if;

  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
    and tablename = 'password_reset_tokens'
    and policyname = 'Allow token verification'
  ) then
    drop policy if exists "Allow token verification" on password_reset_tokens;
  end if;
end$$;
-- Create new storage policies
create policy "Allow public uploads"
on storage.objects for insert
with check (
  bucket_id = 'company-documents'
);
create policy "Allow public reads"
on storage.objects for select
using (
  bucket_id = 'company-documents'
);
-- Create bus_companies table
CREATE TABLE IF NOT EXISTS bus_companies (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  registration_number TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active',
  registration_id BIGINT REFERENCES bus_company_registrations(id),
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- Create password_reset_tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE
);
-- Add RLS policies for bus_companies
ALTER TABLE bus_companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read of bus companies"
  ON bus_companies FOR SELECT
  TO authenticated
  USING (true);
CREATE POLICY "Allow admins to manage bus companies"
  ON bus_companies FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'asassin.damian@gmail.com');
-- Add RLS policies for password_reset_tokens
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow admins to manage password reset tokens"
  ON password_reset_tokens FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'asassin.damian@gmail.com');
CREATE POLICY "Allow token verification"
  ON password_reset_tokens FOR SELECT
  TO authenticated
  USING (true);
