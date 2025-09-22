-- Fix missing RLS policies

-- Add missing policies for profiles table (allow counselors to view all profiles for patient management)
CREATE POLICY "Counselors can view all profiles" 
ON public.profiles FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.role IN ('counselor', 'admin')
  )
);

-- Add policy for counselors to manage patient relationships
CREATE POLICY "Counselors can insert patient relationships" 
ON public.counselor_patients FOR INSERT 
WITH CHECK (auth.uid() = counselor_id);

CREATE POLICY "Counselors can update patient relationships" 
ON public.counselor_patients FOR UPDATE 
USING (auth.uid() = counselor_id);

-- Add policy for users to view their own feedback
CREATE POLICY "Users can view their own feedback" 
ON public.feedback FOR SELECT 
USING (auth.uid() = user_id);