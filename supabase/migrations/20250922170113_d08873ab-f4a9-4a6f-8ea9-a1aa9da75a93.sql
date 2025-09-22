-- Add remaining RLS policies to cover all CRUD operations

-- Add DELETE policies where missing
CREATE POLICY "Users can delete their own questionnaire responses" 
ON public.questionnaire_responses FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own feedback" 
ON public.feedback FOR DELETE 
USING (auth.uid() = user_id);

-- Add UPDATE policies where missing  
CREATE POLICY "Users can update their own questionnaire responses" 
ON public.questionnaire_responses FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own feedback" 
ON public.feedback FOR UPDATE 
USING (auth.uid() = user_id);

-- Add DELETE policies for counselor relationships
CREATE POLICY "Counselors can delete patient relationships" 
ON public.counselor_patients FOR DELETE 
USING (auth.uid() = counselor_id);