-- Create Roles table
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert initial roles
INSERT INTO public.roles (name) VALUES 
('estudiante'), 
('profesor_pendiente'), 
('profesor_aprobado')
ON CONFLICT (name) DO NOTHING;

-- Update profiles table to include role_id
-- Assuming profiles already exists based on previous conversations
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role_id') THEN
        ALTER TABLE public.profiles ADD COLUMN role_id UUID REFERENCES public.roles(id);
        
        -- Default to 'estudiante' role
        UPDATE public.profiles 
        SET role_id = (SELECT id FROM public.roles WHERE name = 'estudiante')
        WHERE role_id IS NULL;
        
        ALTER TABLE public.profiles ALTER COLUMN role_id SET NOT NULL;
    END IF;
END $$;

-- Create Teacher Applications table
CREATE TABLE IF NOT EXISTS public.teacher_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    document_title TEXT NOT NULL,
    document_type TEXT NOT NULL,
    issuing_institution TEXT NOT NULL,
    document_url TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies
ALTER TABLE public.teacher_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own applications" 
ON public.teacher_applications FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own applications" 
ON public.teacher_applications FOR SELECT 
USING (auth.uid() = user_id);

-- Storage bucket setup (Manual step usually, but policy defined here)
-- Note: Buckets are managed via Supabase dashboard or API, but we define policies.
-- Policy for 'teacher-certifications' bucket
-- This assumes the bucket is already created or will be.

-- Function to handle application submission and role update atomically
CREATE OR REPLACE FUNCTION public.submit_teacher_application(
    p_document_title TEXT,
    p_document_type TEXT,
    p_issuing_institution TEXT,
    p_document_url TEXT
) RETURNS VOID AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_pending_role_id UUID;
BEGIN
    -- Get 'profesor_pendiente' role id
    SELECT id INTO v_pending_role_id FROM public.roles WHERE name = 'profesor_pendiente';

    -- Insert application
    INSERT INTO public.teacher_applications (user_id, document_title, document_type, issuing_institution, document_url)
    VALUES (v_user_id, p_document_title, p_document_type, p_issuing_institution, p_document_url);

    -- Update user profile role
    UPDATE public.profiles 
    SET role_id = v_pending_role_id
    WHERE id = v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
