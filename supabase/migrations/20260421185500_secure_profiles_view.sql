-- Migration: secure_profiles_view
-- Drops insecure policies and creates a secure public view for profiles

-- 1. Remove permissive policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.usuarios;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.usuarios;

-- Ensure RLS is active
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- 2. Restrict direct SELECT to only the owner
CREATE POLICY "Users can view their own profile" 
ON public.usuarios FOR SELECT 
USING ( auth.uid() = id );

-- 3. Create a public view emitting only safe columns
CREATE OR REPLACE VIEW public.perfiles_publicos AS
SELECT 
    id, 
    nombre, 
    avatar_url, 
    instrumento,
    gustos_musicales,
    rol
FROM public.usuarios;

-- 4. Grant access to the view
GRANT SELECT ON public.perfiles_publicos TO authenticated, anon;
