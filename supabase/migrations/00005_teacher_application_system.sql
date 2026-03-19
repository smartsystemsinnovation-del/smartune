-- Update existing usuarios table to support new roles
ALTER TABLE public.usuarios DROP CONSTRAINT IF EXISTS usuarios_rol_check;
ALTER TABLE public.usuarios ADD CONSTRAINT usuarios_rol_check 
CHECK (rol IN ('estudiante', 'profesor', 'administrador', 'profesor_pendiente'));

-- Create Teacher Applications table
CREATE TABLE IF NOT EXISTS public.teacher_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE NOT NULL,
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

-- Function to handle application submission and role update atomically
CREATE OR REPLACE FUNCTION public.submit_teacher_application(
    p_document_title TEXT,
    p_document_type TEXT,
    p_issuing_institution TEXT,
    p_document_url TEXT
) RETURNS VOID AS $$
DECLARE
    v_user_id UUID := auth.uid();
BEGIN
    -- Insert application
    INSERT INTO public.teacher_applications (user_id, document_title, document_type, issuing_institution, document_url)
    VALUES (v_user_id, p_document_title, p_document_type, p_issuing_institution, p_document_url);

    -- Update user role
    UPDATE public.usuarios 
    SET rol = 'profesor_pendiente'
    WHERE id = v_user_id;

    -- Also insert/update into profesores
    INSERT INTO public.profesores (id, certificaciones, estado_verificacion)
    VALUES (v_user_id, p_document_title, 'pendiente')
    ON CONFLICT (id) DO UPDATE SET estado_verificacion = 'pendiente';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
