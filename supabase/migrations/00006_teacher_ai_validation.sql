-- Function to handle application submission with dynamic status and role
CREATE OR REPLACE FUNCTION public.submit_teacher_application_ai(
    p_document_title TEXT,
    p_document_type TEXT,
    p_issuing_institution TEXT,
    p_document_url TEXT,
    p_status TEXT, -- 'pending', 'approved'
    p_role TEXT -- 'profesor_pendiente', 'profesor'
) RETURNS VOID AS $$
DECLARE
    v_user_id UUID := auth.uid();
BEGIN
    -- Insert application with the determined status
    INSERT INTO public.teacher_applications (user_id, document_title, document_type, issuing_institution, document_url, status)
    VALUES (v_user_id, p_document_title, p_document_type, p_issuing_institution, p_document_url, p_status);

    -- Update user role
    UPDATE public.usuarios 
    SET rol = p_role
    WHERE id = v_user_id;

    -- Also insert/update into profesores
    -- If approved directly, set state to 'verificado', otherwise 'pendiente'
    INSERT INTO public.profesores (id, certificaciones, estado_verificacion)
    VALUES (
        v_user_id, 
        p_document_title, 
        CASE WHEN p_status = 'approved' THEN 'verificado' ELSE 'pendiente' END
    )
    ON CONFLICT (id) DO UPDATE SET 
        estado_verificacion = CASE WHEN p_status = 'approved' THEN 'verificado' ELSE 'pendiente' END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
