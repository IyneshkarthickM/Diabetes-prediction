-- Create a table for public user accounts
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  role_specific_id TEXT UNIQUE NOT NULL, -- This will be the user-facing 'Patient ID' or 'Doctor ID'
  full_name TEXT NOT NULL,
  password TEXT NOT NULL, -- Note: In a real app, passwords should always be hashed.
  role TEXT NOT NULL CHECK (role IN ('patient', 'doctor'))
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to create (sign up) and read (log in) user accounts.
-- This is a permissive policy for demonstration purposes.
CREATE POLICY "Enable insert and select for everyone" 
ON public.users
FOR ALL
USING (true)
WITH CHECK (true);
