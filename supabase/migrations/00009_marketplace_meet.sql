-- ==============================================
-- MARKETPLACE & CLASES (GOOGLE MEET) INTEGRATION
-- ==============================================

-- 1. Tabla para Conexiones Alumno-Profesor
CREATE TABLE IF NOT EXISTS public.student_teacher_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'accepted', -- 'pending' o 'accepted'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(student_id, teacher_id) -- Un alumno no puede conectar con el mismo profe dos veces
);

-- Políticas RLS para Conexiones
ALTER TABLE public.student_teacher_connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios pueden ver sus propias conexiones" ON public.student_teacher_connections;
CREATE POLICY "Usuarios pueden ver sus propias conexiones" 
ON public.student_teacher_connections FOR SELECT 
USING (auth.uid() = student_id OR auth.uid() = teacher_id);

DROP POLICY IF EXISTS "Estudiantes pueden crear conexiones" ON public.student_teacher_connections;
CREATE POLICY "Estudiantes pueden crear conexiones" 
ON public.student_teacher_connections FOR INSERT 
WITH CHECK (auth.uid() = student_id);

-- 2. Tabla para Clases con Enlace de Google Meet
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    meet_link TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'completed', 'cancelled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Políticas RLS para Clases
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios pueden ver sus propias clases" ON public.classes;
CREATE POLICY "Usuarios pueden ver sus propias clases" 
ON public.classes FOR SELECT 
USING (auth.uid() = student_id OR auth.uid() = teacher_id);

DROP POLICY IF EXISTS "Profesores pueden crear clases" ON public.classes;
CREATE POLICY "Profesores pueden crear clases" 
ON public.classes FOR INSERT 
WITH CHECK (auth.uid() = teacher_id);

-- 3. Vista utilitaria para el Dropdown (Opcional pero sugerida por buenas prácticas)
CREATE OR REPLACE VIEW public.teacher_students_view AS
SELECT 
    c.teacher_id,
    c.student_id,
    u.nombre AS student_name,
    u.correo AS student_email,
    u.avatar_url AS student_avatar
FROM public.student_teacher_connections c
JOIN public.usuarios u ON c.student_id = u.id
WHERE c.status = 'accepted';
