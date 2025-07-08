-- Enable RLS (Row Level Security)
alter table auth.users enable row level security;

-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  phone text,
  role text default 'user' check (role in ('user', 'admin')),
  is_verified boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles table
alter table public.profiles enable row level security;

-- Create policies for profiles table
create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

create policy "Users can delete own profile." on profiles
  for delete using (auth.uid() = id);

-- Create function to handle new user registration
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'role', 'user')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user registration
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create trigger for updated_at
create trigger handle_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- Create user_sessions table for tracking login sessions
create table public.user_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  session_token text unique not null,
  device_info text,
  ip_address inet,
  last_accessed timestamp with time zone default timezone('utc'::text, now()),
  expires_at timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on user_sessions
alter table public.user_sessions enable row level security;

-- Create policies for user_sessions
create policy "Users can view own sessions." on user_sessions
  for select using (auth.uid() = user_id);

create policy "Users can insert own sessions." on user_sessions
  for insert with check (auth.uid() = user_id);

create policy "Users can update own sessions." on user_sessions
  for update using (auth.uid() = user_id);

create policy "Users can delete own sessions." on user_sessions
  for delete using (auth.uid() = user_id);
