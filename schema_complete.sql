-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users Table
create table if not exists users (
  id uuid default uuid_generate_v4() primary key,
  mobile text unique not null,
  name text,
  email text,
  verified boolean default false,
  joined_at timestamp with time zone default timezone('utc'::text, now())
);

-- OTPs Table (New)
create table if not exists otps (
    mobile text primary key,
    code text not null,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Investments Table
create table if not exists investments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id) not null,
  base_amount numeric not null,
  expected_return numeric,
  days integer,
  status text check (status in ('pending', 'verifying', 'active', 'completed', 'paid', 'rejected')) default 'pending',
  payment_method text,
  receipt_url text, -- Path to file or URL
  utr_number text,  -- For P2P
  submitted_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Transactions Table
create table if not exists transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id) not null,
  type text check (type in ('deposit', 'withdraw')) not null,
  amount numeric not null,
  status text default 'success',
  gateway_payment_id text,
  timestamp timestamp with time zone default timezone('utc'::text, now())
);

-- Admin Settings Table
create table if not exists admin_settings (
  id integer primary key generated always as identity,
  upi_id text,
  qr_code_url text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Insert initial admin settings if empty
insert into admin_settings (upi_id, qr_code_url)
select 'invest@personal', ''
where not exists (select 1 from admin_settings);

-- RLS Policies (Open for now)
alter table users enable row level security;
alter table otps enable row level security;
alter table investments enable row level security;
alter table transactions enable row level security;
alter table admin_settings enable row level security;

create policy "Public access" on users for all using (true);
create policy "Public access" on otps for all using (true);
create policy "Public access" on investments for all using (true);
create policy "Public access" on transactions for all using (true);
create policy "Public access" on admin_settings for all using (true);
