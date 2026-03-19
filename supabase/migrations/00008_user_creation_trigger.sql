-- Migración para sincronizar automáticamente los usuarios de Auth con public.usuarios

-- 1. Crear la función que maneja el registro del nuevo usuario
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (id, nombre, correo, rol)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email, 'Usuario Nuevo'),
    COALESCE(NEW.email, NEW.id::text || '@smartune.app'),
    'estudiante'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Crear el trigger para que escuche cuando un usuario se registra
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. IMPORTANTE: Rellenar (Backfill) cualquier usuario que ya exista en auth.users
-- pero que no exista en public.usuarios (Lo que causa el error actual)
INSERT INTO public.usuarios (id, nombre, correo, rol)
SELECT 
    id, 
    COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', email, 'Usuario Existente'),
    COALESCE(email, id::text || '@smartune.app'),
    'estudiante'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.usuarios)
ON CONFLICT (id) DO NOTHING;
