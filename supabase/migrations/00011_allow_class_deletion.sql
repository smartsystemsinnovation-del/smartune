-- Permitir que tanto el profesor como el alumno puedan borrar/cancelar clases
DROP POLICY IF EXISTS "Usuarios pueden borrar sus propias clases" ON public.classes;
CREATE POLICY "Usuarios pueden borrar sus propias clases" 
ON public.classes FOR DELETE 
USING (auth.uid() = student_id OR auth.uid() = teacher_id);

-- Permitir que el profesor actualice la clase (por si necesita cambiar el título o link)
DROP POLICY IF EXISTS "Profesores pueden actualizar sus clases" ON public.classes;
CREATE POLICY "Profesores pueden actualizar sus clases" 
ON public.classes FOR UPDATE 
USING (auth.uid() = teacher_id);
