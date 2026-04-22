-- Migration: fix_favoritos_fk
-- Dropping incorrect foreign key to auth.users and pointing it to public.usuarios

ALTER TABLE public.favoritos 
DROP CONSTRAINT IF EXISTS favoritos_usuario_id_fkey;

-- Recreate constraint pointing directly to our public users table
ALTER TABLE public.favoritos 
ADD CONSTRAINT favoritos_usuario_id_fkey 
FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id)
ON DELETE CASCADE;
