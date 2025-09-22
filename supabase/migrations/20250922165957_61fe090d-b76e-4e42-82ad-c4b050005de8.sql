-- Create user roles enum
CREATE TYPE public.user_role AS ENUM ('patient', 'counselor', 'admin');

-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'patient',
  phone TEXT,
  date_of_birth DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create questionnaire responses table for PHQ-9 and GAD-7
CREATE TABLE public.questionnaire_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  questionnaire_type TEXT NOT NULL, -- 'PHQ9' or 'GAD7'
  responses JSONB NOT NULL,
  total_score INTEGER NOT NULL,
  severity_level TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create counselor-patient relationships table
CREATE TABLE public.counselor_patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  counselor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(counselor_id, patient_id)
);

-- Create journal entries table
CREATE TABLE public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 10),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create feedback table
CREATE TABLE public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  message TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionnaire_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.counselor_patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for questionnaire responses
CREATE POLICY "Users can view their own responses" 
ON public.questionnaire_responses FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own responses" 
ON public.questionnaire_responses FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Counselors can view their patients' responses" 
ON public.questionnaire_responses FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.counselor_patients cp 
    WHERE cp.counselor_id = auth.uid() 
    AND cp.patient_id = questionnaire_responses.user_id 
    AND cp.is_active = true
  )
);

-- Create RLS policies for counselor-patient relationships
CREATE POLICY "Counselors can view their patients" 
ON public.counselor_patients FOR SELECT USING (auth.uid() = counselor_id);

CREATE POLICY "Patients can view their counselors" 
ON public.counselor_patients FOR SELECT USING (auth.uid() = patient_id);

-- Create RLS policies for journal entries
CREATE POLICY "Users can manage their own journal entries" 
ON public.journal_entries FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Counselors can view their patients' journal entries" 
ON public.journal_entries FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.counselor_patients cp 
    WHERE cp.counselor_id = auth.uid() 
    AND cp.patient_id = journal_entries.user_id 
    AND cp.is_active = true
  )
);

-- Create RLS policies for feedback
CREATE POLICY "Users can insert feedback" 
ON public.feedback FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all feedback" 
ON public.feedback FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.role IN ('admin', 'counselor')
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates on profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'patient'::user_role)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();