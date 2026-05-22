-- 1. Promover cualquier cuenta creada previamente con este correo a administrador
UPDATE public.usuarios 
SET rol = 'administrador' 
WHERE correo = 'admin@smartune.app';

-- Seed the administrator auth user if not exists
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'a0000000-0000-0000-0000-00000000000a',
  'authenticated',
  'authenticated',
  'admin@smartune.app',
  crypt('admin2008', gen_salt('bf')),
  now(),
  null,
  null,
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Administrador"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- Sincronizar en public.usuarios con rol 'administrador'
INSERT INTO public.usuarios (id, nombre, correo, rol)
VALUES ('a0000000-0000-0000-0000-00000000000a', 'Administrador', 'admin@smartune.app', 'administrador')
ON CONFLICT (id) DO UPDATE SET rol = 'administrador';

-- Expandir políticas de RLS para teacher_applications
DROP POLICY IF EXISTS "Admins can view all applications" ON public.teacher_applications;
CREATE POLICY "Admins can view all applications"
ON public.teacher_applications FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE id = auth.uid() AND rol = 'administrador'
  )
);

DROP POLICY IF EXISTS "Admins can update applications" ON public.teacher_applications;
CREATE POLICY "Admins can update applications"
ON public.teacher_applications FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE id = auth.uid() AND rol = 'administrador'
  )
);

-- Expandir políticas de RLS para usuarios
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.usuarios;
CREATE POLICY "Admins can update all profiles"
ON public.usuarios FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE id = auth.uid() AND rol = 'administrador'
  )
);

-- Expandir políticas de RLS para profesores
DROP POLICY IF EXISTS "Admins can manage all professors" ON public.profesores;
CREATE POLICY "Admins can manage all professors"
ON public.profesores FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE id = auth.uid() AND rol = 'administrador'
  )
);
