-- Migration: Sincronización completa de Google OAuth (con avatar)
-- Reemplaza la preexistente "handle_new_user"

CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (id, nombre, correo, rol, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email, 'Usuario Nuevo'),
    COALESCE(NEW.email, NEW.id::text || '@smartune.app'),
    'estudiante',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    -- Solo actualizamos avatar si no tenía uno y ahora sí le llega uno por login
    avatar_url = EXCLUDED.avatar_url
    WHERE public.usuarios.avatar_url IS NULL AND EXCLUDED.avatar_url IS NOT NULL;
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
