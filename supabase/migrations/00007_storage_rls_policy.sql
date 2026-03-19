-- Configuración del Bucket de Storage para Certificaciones

-- 1. Crear el bucket 'teacher-certifications' si no existe y hacerlo público
INSERT INTO storage.buckets (id, name, public)
VALUES ('teacher-certifications', 'teacher-certifications', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Eliminar políticas anteriores si existen (para evitar duplicados al re-ejecutar)
DROP POLICY IF EXISTS "Public Access for Certifications" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload certifications" ON storage.objects;

-- 3. Crear política para permitir que cualquiera pueda VER (Leer) los archivos
CREATE POLICY "Public Access for Certifications" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'teacher-certifications');

-- 4. Crear política para permitir que usuarios AUTENTICADOS puedan SUBIR archivos
CREATE POLICY "Authenticated users can upload certifications" 
ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'teacher-certifications' 
    AND auth.role() = 'authenticated'
);
