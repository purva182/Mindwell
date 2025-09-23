-- Remove the overly permissive policy
DROP POLICY IF EXISTS "System can insert emergency alerts" ON public.emergency_alerts;

-- Create a secure policy that only allows users to insert alerts for themselves
CREATE POLICY "Users can insert their own emergency alerts" 
ON public.emergency_alerts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Add additional validation policy to ensure only authenticated users
CREATE POLICY "Only authenticated users can insert alerts" 
ON public.emergency_alerts 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);