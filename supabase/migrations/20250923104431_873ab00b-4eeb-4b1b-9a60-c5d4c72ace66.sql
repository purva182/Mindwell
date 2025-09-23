-- Update the handle_new_user function to include parent_phone and emergency_contact_name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
begin
  insert into public.profiles (user_id, email, full_name, role, parent_phone, emergency_contact_name)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data ->> 'full_name',
    COALESCE((new.raw_user_meta_data ->> 'role')::user_role, 'patient'::user_role),
    new.raw_user_meta_data ->> 'parent_phone',
    new.raw_user_meta_data ->> 'emergency_contact_name'
  );
  return new;
end;
$$;