-- Create the table for storing patient health data and predictions
CREATE TABLE public.patients (
  id TEXT PRIMARY KEY NOT NULL, -- Using the patient's name as a unique ID
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  gender TEXT,
  age REAL,
  hypertension SMALLINT,
  heart_disease SMALLINT,
  smoking_history TEXT,
  bmi REAL,
  hba1c_level REAL,
  blood_glucose_level REAL,
  prediction_status TEXT,
  risk_level TEXT,
  probability TEXT
);

-- Enable Row Level Security (RLS) on the table
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows logged-in users to do everything (select, insert, update, delete)
-- For a real app, you'd want more restrictive policies.
CREATE POLICY "Enable all access for authenticated users"
ON public.patients
FOR ALL
USING (auth.role() = 'anon')
WITH CHECK (auth.role() = 'anon');
