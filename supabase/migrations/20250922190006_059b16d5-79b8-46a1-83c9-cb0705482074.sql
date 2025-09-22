-- Add parent phone number to profiles table
ALTER TABLE public.profiles 
ADD COLUMN parent_phone text,
ADD COLUMN emergency_contact_name text;

-- Create permissions table
CREATE TABLE public.user_permissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  location_permission boolean NOT NULL DEFAULT false,
  data_sharing_permission boolean NOT NULL DEFAULT false,
  emergency_contact_permission boolean NOT NULL DEFAULT false,
  granted_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on user_permissions
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- Create policies for user_permissions
CREATE POLICY "Users can view their own permissions" 
ON public.user_permissions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own permissions" 
ON public.user_permissions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own permissions" 
ON public.user_permissions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Counselors can view their patients' permissions
CREATE POLICY "Counselors can view their patients' permissions" 
ON public.user_permissions 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM counselor_patients cp 
  WHERE cp.counselor_id = auth.uid() 
  AND cp.patient_id = user_permissions.user_id 
  AND cp.is_active = true
));

-- Create emergency alerts table
CREATE TABLE public.emergency_alerts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  questionnaire_type text NOT NULL,
  total_score integer NOT NULL,
  severity_level text NOT NULL,
  alert_sent_to_counselor boolean NOT NULL DEFAULT false,
  alert_sent_to_parent boolean NOT NULL DEFAULT false,
  counselor_email text,
  parent_phone text,
  user_location text,
  alert_message text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on emergency_alerts
ALTER TABLE public.emergency_alerts ENABLE ROW LEVEL SECURITY;

-- Policies for emergency_alerts
CREATE POLICY "Users can view their own alerts" 
ON public.emergency_alerts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Counselors can view their patients' alerts" 
ON public.emergency_alerts 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM counselor_patients cp 
  WHERE cp.counselor_id = auth.uid() 
  AND cp.patient_id = emergency_alerts.user_id 
  AND cp.is_active = true
));

-- System can insert emergency alerts
CREATE POLICY "System can insert emergency alerts" 
ON public.emergency_alerts 
FOR INSERT 
WITH CHECK (true);

-- Create trigger for updated_at on user_permissions
CREATE TRIGGER update_user_permissions_updated_at
BEFORE UPDATE ON public.user_permissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();