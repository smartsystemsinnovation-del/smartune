-- ==============================================
-- FIX NOTIFICATION TRIGGERS
-- Uses pg_net to call Edge Function directly.
-- The anon key is used for Authorization (it is public by design).
-- The Edge Function itself uses the private FIREBASE_SERVICE_ACCOUNT secret.
-- ==============================================

-- Ensure pg_net is enabled
CREATE EXTENSION IF NOT EXISTS pg_net;

-- ── LIKE NOTIFICATION ──────────────────────────────────────
CREATE OR REPLACE FUNCTION public.notify_new_like()
RETURNS TRIGGER AS $$
DECLARE
  post_owner_id   UUID;
  post_owner_token TEXT;
  liker_name      TEXT;
BEGIN
  -- Get post owner
  SELECT user_id INTO post_owner_id FROM public.posts WHERE id = NEW.post_id;

  -- Skip self-likes
  IF post_owner_id IS NULL OR post_owner_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  SELECT fcm_token INTO post_owner_token FROM public.usuarios WHERE id = post_owner_id;
  SELECT nombre    INTO liker_name       FROM public.usuarios WHERE id = NEW.user_id;

  IF post_owner_token IS NOT NULL THEN
    PERFORM net.http_post(
      url     := 'https://mpsmvszyzrtxwadmjuei.supabase.co/functions/v1/send-notification',
      headers := jsonb_build_object(
        'Content-Type',  'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wc212c3p5enJ0eHdhZG1qdWVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1MzY1NjAsImV4cCI6MjA4OTExMjU2MH0.FIdxI_ek02hfaE4lNe5bn8vcYs9-n-i1dT9k4OEVCU8'
      ),
      body    := jsonb_build_object(
        'fcm_token', post_owner_token,
        'title',     '❤️ Nuevo Like',
        'body',      COALESCE(liker_name, 'Alguien') || ' le dio me gusta a tu publicación'
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_new_like ON public.likes;
CREATE TRIGGER on_new_like
  AFTER INSERT ON public.likes
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_like();

-- ── COMMENT NOTIFICATION ───────────────────────────────────
CREATE OR REPLACE FUNCTION public.notify_new_comment()
RETURNS TRIGGER AS $$
DECLARE
  post_owner_id    UUID;
  post_owner_token TEXT;
  commenter_name   TEXT;
BEGIN
  SELECT user_id INTO post_owner_id FROM public.posts WHERE id = NEW.post_id;

  IF post_owner_id IS NULL OR post_owner_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  SELECT fcm_token INTO post_owner_token FROM public.usuarios WHERE id = post_owner_id;
  SELECT nombre    INTO commenter_name   FROM public.usuarios WHERE id = NEW.user_id;

  IF post_owner_token IS NOT NULL THEN
    PERFORM net.http_post(
      url     := 'https://mpsmvszyzrtxwadmjuei.supabase.co/functions/v1/send-notification',
      headers := jsonb_build_object(
        'Content-Type',  'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wc212c3p5enJ0eHdhZG1qdWVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1MzY1NjAsImV4cCI6MjA4OTExMjU2MH0.FIdxI_ek02hfaE4lNe5bn8vcYs9-n-i1dT9k4OEVCU8'
      ),
      body    := jsonb_build_object(
        'fcm_token', post_owner_token,
        'title',     '💬 Nuevo Comentario',
        'body',      COALESCE(commenter_name, 'Alguien') || ' comentó en tu publicación'
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_new_comment ON public.post_comments;
CREATE TRIGGER on_new_comment
  AFTER INSERT ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_comment();

-- ── CLASS SCHEDULED NOTIFICATION ───────────────────────────
CREATE OR REPLACE FUNCTION public.notify_new_class()
RETURNS TRIGGER AS $$
DECLARE
  student_token TEXT;
  teacher_name  TEXT;
BEGIN
  SELECT fcm_token INTO student_token FROM public.usuarios WHERE id = NEW.student_id;
  SELECT nombre    INTO teacher_name  FROM public.usuarios WHERE id = NEW.teacher_id;

  IF student_token IS NOT NULL THEN
    PERFORM net.http_post(
      url     := 'https://mpsmvszyzrtxwadmjuei.supabase.co/functions/v1/send-notification',
      headers := jsonb_build_object(
        'Content-Type',  'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wc212c3p5enJ0eHdhZG1qdWVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1MzY1NjAsImV4cCI6MjA4OTExMjU2MH0.FIdxI_ek02hfaE4lNe5bn8vcYs9-n-i1dT9k4OEVCU8'
      ),
      body    := jsonb_build_object(
        'fcm_token', student_token,
        'title',     '📚 Nueva Clase Programada',
        'body',      COALESCE(teacher_name, 'Tu profesor') || ' agendó la clase: ' || COALESCE(NEW.title, 'Nueva clase')
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_new_class ON public.classes;
CREATE TRIGGER on_new_class
  AFTER INSERT ON public.classes
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_class();
