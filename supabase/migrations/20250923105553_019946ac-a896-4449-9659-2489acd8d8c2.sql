-- Fix infinite recursion in profiles RLS policy by creating a security definer function
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Counselors can view all profiles" ON public.profiles;

-- Create a new policy using the security definer function
CREATE POLICY "Counselors can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.get_current_user_role() = ANY (ARRAY['counselor'::user_role, 'admin'::user_role]));

-- Secure the orphaned Profile table by adding proper policies
CREATE POLICY "Users can view their own profile" 
ON public."Profile" 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own profile" 
ON public."Profile" 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert their own profile" 
ON public."Profile" 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);