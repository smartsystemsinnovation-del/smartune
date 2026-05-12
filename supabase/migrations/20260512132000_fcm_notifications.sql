-- ==============================================
-- FCM PUSH NOTIFICATIONS SCHEMA AND TRIGGERS
-- ==============================================

-- 1. Enable pg_net extension to make HTTP requests from Postgres
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Add fcm_token to usuarios
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS fcm_token TEXT;

-- 3. Function to trigger notification on new Like
CREATE OR REPLACE FUNCTION public.notify_new_like()
RETURNS TRIGGER AS $$
DECLARE
  post_owner_id UUID;
  post_owner_token TEXT;
  liker_name TEXT;
  supabase_url TEXT;
  service_key TEXT;
BEGIN
  -- Get post owner
  SELECT user_id INTO post_owner_id FROM public.posts WHERE id = NEW.post_id;
  
  -- Get owner fcm_token
  SELECT fcm_token INTO post_owner_token FROM public.usuarios WHERE id = post_owner_id;
  
  -- Get liker name
  SELECT nombre INTO liker_name FROM public.usuarios WHERE id = NEW.user_id;

  -- Obtenemos las URLs y keys internas (solo funciona en el entorno hospedado de Supabase o local con config correcta)
  -- En caso de fallar en entorno hospedado, puedes reemplazar estas variables por las reales (URL de tu proyecto y service role key)
  supabase_url := current_setting('custom.supabase_url', true);
  service_key := current_setting('custom.supabase_service_role_key', true);

  -- Only send if the owner has a token and it's not a self-like
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
          'title', '¡Nuevo Like!',
          'body', liker_name || ' le dio me gusta a tu publicación.'
        )
      );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create Trigger
DROP TRIGGER IF EXISTS on_new_like ON public.likes;
CREATE TRIGGER on_new_like
AFTER INSERT ON public.likes
FOR EACH ROW EXECUTE FUNCTION public.notify_new_like();
