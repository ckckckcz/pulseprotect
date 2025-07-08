-- Enable required extensions
create extension if not exists "pgcrypto";

-- Drop the table if it exists to recreate with proper policies
drop table if exists public.users cascade;

-- Create users table
create table public.users (
  id uuid primary key,
  email text unique not null,
  full_name text not null,
  password_hash text not null,
  phone text,
  role text default 'user' check (role in ('user', 'admin', 'manager')),
  is_active boolean default true,
  is_verified boolean default false,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on users table
alter table public.users enable row level security;

-- Create policies for users table
-- Allow authenticated users to insert their own data (during registration)
create policy "Users can insert own data" on users
  for insert with check (auth.uid() = id);

-- Allow users to view their own data
create policy "Users can view own profile" on users
  for select using (auth.uid() = id);

-- Allow users to update their own data
create policy "Users can update own profile" on users
  for update using (auth.uid() = id);

-- Allow service role to manage all users (for admin functions)
create policy "Service role can manage all users" on users
  for all using (auth.role() = 'service_role');

-- Create indexes for better performance
create index if not exists users_email_idx on public.users(email);
create index if not exists users_role_idx on public.users(role);
create index if not exists users_created_at_idx on public.users(created_at);

-- Create function to update updated_at timestamp
create or replace function public.update_users_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create trigger for updated_at
drop trigger if exists update_users_updated_at on public.users;
create trigger update_users_updated_at
  before update on public.users
  for each row execute procedure public.update_users_updated_at();

-- Create function to automatically create user profile after auth signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, password_hash, phone)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    '',  -- Password hash will be set separately
    new.raw_user_meta_data->>'phone'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user creation
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
