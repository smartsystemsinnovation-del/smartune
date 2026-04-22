-- Unificación de tablas de relaciones profesor-alumno
CREATE TABLE IF NOT EXISTS public.relaciones_profesor_alumno (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  teacher_id TEXT NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pendiente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insertar datos legacy (si existen y si la tabla legacy existe)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'student_teacher_connections') THEN
    INSERT INTO public.relaciones_profesor_alumno (id, student_id, teacher_id, status, created_at)
    SELECT id, student_id, teacher_id, status, created_at FROM public.student_teacher_connections;
  END IF;
END $$;

-- Unificación de tabla de comentarios con arquitectura polimórfica (target_id, target_type)
CREATE TABLE IF NOT EXISTS public.comentarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  target_id UUID NOT NULL,
  target_type TEXT NOT NULL, -- 'post', 'clase', etc.
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insertar datos legacy (si existen y si la tabla legacy existe)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'post_comments') THEN
    INSERT INTO public.comentarios (id, user_id, target_id, target_type, content, created_at)
    SELECT id, user_id, post_id, 'post', content, created_at FROM public.post_comments;
  END IF;
END $$;

-- Eliminar tablas obsoletas tras migrar datos
DROP TABLE IF EXISTS public.student_teacher_connections CASCADE;
DROP TABLE IF EXISTS public.profesor_alumno CASCADE;
DROP TABLE IF EXISTS public.post_comments CASCADE;
