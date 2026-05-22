-- =======================================================
-- SMARTUNE: IN-APP SYSTEM NOTIFICATIONS SCHEMA & TRIGGERS
-- =======================================================

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    type VARCHAR(30) NOT NULL, -- 'like', 'comment', 'class', 'connection', 'system'
    read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    data JSONB DEFAULT '{}'::jsonb
);

-- Habilitar RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 1. Políticas: Cada usuario lee solo sus propias notificaciones
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

-- 2. Políticas: Cada usuario puede actualizar sus propias notificaciones (marcar como leídas)
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

-- 3. Políticas: Cada usuario puede borrar sus propias notificaciones
DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;
CREATE POLICY "Users can delete their own notifications"
ON public.notifications FOR DELETE
USING (auth.uid() = user_id);

-- 4. Políticas: Permitir inserciones internas por parte del sistema/triggers
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "System can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (TRUE);


-- =======================================================
-- TRIGGERS DE BASE DE DATOS ACTUALIZADOS E INTEGRADOS
-- =======================================================

-- 1. NOTIFICACIÓN DE NUEVO LIKE (In-App + FCM)
CREATE OR REPLACE FUNCTION public.notify_new_like()
RETURNS TRIGGER AS $$
DECLARE
  post_owner_id UUID;
  post_owner_token TEXT;
  liker_name TEXT;
  supabase_url TEXT;
  service_key TEXT;
BEGIN
  -- Obtener el creador del post
  SELECT user_id INTO post_owner_id FROM public.posts WHERE id = NEW.post_id;
  
  -- Obtener el token de FCM del creador
  SELECT fcm_token INTO post_owner_token FROM public.usuarios WHERE id = post_owner_id;
  
  -- Obtener el nombre del usuario que da el like
  SELECT nombre INTO liker_name FROM public.usuarios WHERE id = NEW.user_id;

  -- Crear notificación in-app (siempre y cuando no sea un auto-like)
  IF NEW.user_id != post_owner_id THEN
    INSERT INTO public.notifications (user_id, title, body, type, data)
    VALUES (
      post_owner_id, 
      '¡Nuevo Like! 💖', 
      liker_name || ' le dio me gusta a tu publicación.', 
      'like', 
      jsonb_build_object('post_id', NEW.post_id, 'liker_id', NEW.user_id)
    );
  END IF;

  -- Enviar también por FCM si existe token y no es auto-like
  supabase_url := current_setting('custom.supabase_url', true);
  service_key := current_setting('custom.supabase_service_role_key', true);

  IF post_owner_token IS NOT NULL AND NEW.user_id != post_owner_id AND supabase_url IS NOT NULL THEN
    PERFORM
      net.http_post(
        url:= supabase_url || '/functions/v1/send-notification',
        headers:=jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || service_key),
        body:=jsonb_build_object(
          'user_id', post_owner_id,
          'fcm_token', post_owner_token,
          'title', '¡Nuevo Like!',
          'body', liker_name || ' le dio me gusta a tu publicación.'
        )
      );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. NOTIFICACIÓN DE NUEVO COMENTARIO (In-App + FCM)
CREATE OR REPLACE FUNCTION public.notify_new_comment()
RETURNS TRIGGER AS $$
DECLARE
  post_owner_id UUID;
  post_owner_token TEXT;
  commenter_name TEXT;
  supabase_url TEXT;
  service_key TEXT;
BEGIN
  -- Obtener el creador del post
  SELECT user_id INTO post_owner_id FROM public.posts WHERE id = NEW.post_id;
  
  -- Obtener el token de FCM del creador
  SELECT fcm_token INTO post_owner_token FROM public.usuarios WHERE id = post_owner_id;
  
  -- Obtener el nombre del usuario que comenta
  SELECT nombre INTO commenter_name FROM public.usuarios WHERE id = NEW.user_id;

  -- Crear notificación in-app (siempre y cuando no sea auto-comentario)
  IF NEW.user_id != post_owner_id THEN
    INSERT INTO public.notifications (user_id, title, body, type, data)
    VALUES (
      post_owner_id, 
      'Nuevo Comentario 💬', 
      commenter_name || ' comentó en tu publicación.', 
      'comment', 
      jsonb_build_object('post_id', NEW.post_id, 'comment_id', NEW.id, 'commenter_id', NEW.user_id)
    );
  END IF;

  -- Enviar también por FCM
  supabase_url := current_setting('custom.supabase_url', true);
  service_key := current_setting('custom.supabase_service_role_key', true);

  IF post_owner_token IS NOT NULL AND NEW.user_id != post_owner_id AND supabase_url IS NOT NULL THEN
    PERFORM
      net.http_post(
        url:= supabase_url || '/functions/v1/send-notification',
        headers:=jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || service_key),
        body:=jsonb_build_object(
          'user_id', post_owner_id,
          'fcm_token', post_owner_token,
          'title', '¡Nuevo Comentario!',
          'body', commenter_name || ' ha comentado en tu publicación.'
        )
      );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. NOTIFICACIÓN DE NUEVA CLASE PROGRAMADA (In-App + FCM)
CREATE OR REPLACE FUNCTION public.notify_new_class()
RETURNS TRIGGER AS $$
DECLARE
  student_token TEXT;
  teacher_name TEXT;
  supabase_url TEXT;
  service_key TEXT;
BEGIN
  -- Obtener token de FCM del alumno
  SELECT fcm_token INTO student_token FROM public.usuarios WHERE id = NEW.student_id;
  
  -- Obtener nombre del profesor
  SELECT nombre INTO teacher_name FROM public.usuarios WHERE id = NEW.teacher_id;

  -- Crear notificación in-app para el alumno
  INSERT INTO public.notifications (user_id, title, body, type, data)
  VALUES (
    NEW.student_id, 
    'Clase Agendada 📅', 
    teacher_name || ' ha programado la clase: ' || NEW.title, 
    'class', 
    jsonb_build_object('class_id', NEW.id, 'teacher_id', NEW.teacher_id)
  );

  -- Enviar también por FCM
  supabase_url := current_setting('custom.supabase_url', true);
  service_key := current_setting('custom.supabase_service_role_key', true);

  IF student_token IS NOT NULL AND supabase_url IS NOT NULL THEN
    PERFORM
      net.http_post(
        url:= supabase_url || '/functions/v1/send-notification',
        headers:=jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || service_key),
        body:=jsonb_build_object(
          'user_id', NEW.student_id,
          'fcm_token', student_token,
          'title', '¡Nueva Clase Programada!',
          'body', teacher_name || ' ha agendado la clase: ' || NEW.title
        )
      );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 4. TRIGGER: NOTIFICACIÓN DE CONEXIÓN ACEPTADA (In-App)
CREATE OR REPLACE FUNCTION public.notify_connection_accepted()
RETURNS TRIGGER AS $$
DECLARE
  teacher_name TEXT;
  student_name TEXT;
BEGIN
  -- Obtener los nombres de los involucrados
  SELECT nombre INTO teacher_name FROM public.usuarios WHERE id = NEW.teacher_id;
  SELECT nombre INTO student_name FROM public.usuarios WHERE id = NEW.student_id;

  -- Solo notificar si la conexión cambia a 'accepted'
  IF NEW.status = 'accepted' AND (TG_OP = 'INSERT' OR OLD.status != 'accepted') THEN
    -- Notificar al alumno
    INSERT INTO public.notifications (user_id, title, body, type, data)
    VALUES (
      NEW.student_id,
      'Conexión Aceptada 🤝',
      '¡Tu solicitud ha sido aprobada! Ahora estás conectado con el profesor ' || teacher_name || '.',
      'connection',
      jsonb_build_object('teacher_id', NEW.teacher_id)
    );

    -- Notificar al profesor
    INSERT INTO public.notifications (user_id, title, body, type, data)
    VALUES (
      NEW.teacher_id,
      'Nueva Conexión 🤝',
      '¡Felicidades! Ahora estás conectado con el alumno ' || student_name || '.',
      'connection',
      jsonb_build_object('student_id', NEW.student_id)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear el Trigger sobre student_teacher_connections
DROP TRIGGER IF EXISTS on_connection_accepted ON public.student_teacher_connections;
CREATE TRIGGER on_connection_accepted
AFTER INSERT OR UPDATE ON public.student_teacher_connections
FOR EACH ROW EXECUTE FUNCTION public.notify_connection_accepted();
