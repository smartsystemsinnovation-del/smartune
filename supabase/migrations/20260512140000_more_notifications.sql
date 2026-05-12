-- ==============================================
-- MORE NOTIFICATIONS: COMMENTS AND CLASSES
-- ==============================================

-- 1. Function to trigger notification on new Comment
CREATE OR REPLACE FUNCTION public.notify_new_comment()
RETURNS TRIGGER AS $$
DECLARE
  post_owner_id UUID;
  post_owner_token TEXT;
  commenter_name TEXT;
  supabase_url TEXT;
  service_key TEXT;
BEGIN
  -- Get post owner
  SELECT user_id INTO post_owner_id FROM public.posts WHERE id = NEW.post_id;
  
  -- Get owner fcm_token
  SELECT fcm_token INTO post_owner_token FROM public.usuarios WHERE id = post_owner_id;
  
  -- Get commenter name
  SELECT nombre INTO commenter_name FROM public.usuarios WHERE id = NEW.user_id;

  supabase_url := current_setting('custom.supabase_url', true);
  service_key := current_setting('custom.supabase_service_role_key', true);

  -- Only send if the owner has a token and it's not a self-comment
  IF post_owner_token IS NOT NULL AND NEW.user_id != post_owner_id AND supabase_url IS NOT NULL THEN
    PERFORM
      net.http_post(
        url:= supabase_url || '/functions/v1/send-notification',
        headers:=jsonb_build_object(
            'Content-Type', 'application/json', 
            'Authorization', 'Bearer ' || service_key
        ),
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

-- Create Trigger for Comments
DROP TRIGGER IF EXISTS on_new_comment ON public.post_comments;
CREATE TRIGGER on_new_comment
AFTER INSERT ON public.post_comments
FOR EACH ROW EXECUTE FUNCTION public.notify_new_comment();

-- 2. Function to trigger notification on new Class Scheduled
CREATE OR REPLACE FUNCTION public.notify_new_class()
RETURNS TRIGGER AS $$
DECLARE
  student_token TEXT;
  teacher_name TEXT;
  supabase_url TEXT;
  service_key TEXT;
BEGIN
  -- Get student fcm_token
  SELECT fcm_token INTO student_token FROM public.usuarios WHERE id = NEW.student_id;
  
  -- Get teacher name
  SELECT nombre INTO teacher_name FROM public.usuarios WHERE id = NEW.teacher_id;

  supabase_url := current_setting('custom.supabase_url', true);
  service_key := current_setting('custom.supabase_service_role_key', true);

  -- Only send if the student has a token
  IF student_token IS NOT NULL AND supabase_url IS NOT NULL THEN
    PERFORM
      net.http_post(
        url:= supabase_url || '/functions/v1/send-notification',
        headers:=jsonb_build_object(
            'Content-Type', 'application/json', 
            'Authorization', 'Bearer ' || service_key
        ),
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

-- Create Trigger for Classes
DROP TRIGGER IF EXISTS on_new_class ON public.classes;
CREATE TRIGGER on_new_class
AFTER INSERT ON public.classes
FOR EACH ROW EXECUTE FUNCTION public.notify_new_class();
