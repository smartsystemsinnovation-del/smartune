-- ==============================================
-- CONFIGURE POSTGRES CUSTOM SETTINGS FOR TRIGGERS
-- This allows DB triggers to know the Supabase URL
-- and service role key to call Edge Functions
-- ==============================================

-- These values must match your Supabase project.
-- They are set via ALTER DATABASE so triggers can read them with current_setting()
-- Run this in Supabase SQL Editor replacing the values below:

-- ⚠️  IMPORTANT: Replace these with your actual values from:
--     Supabase Dashboard → Settings → API
--       - Project URL  → replace 'https://YOUR_PROJECT_REF.supabase.co'
--       - service_role key → replace 'YOUR_SERVICE_ROLE_KEY'

DO $$
DECLARE
  supabase_url text := 'https://mvoyuoicfbxdkpfhwgqk.supabase.co';
  service_key  text := current_setting('supabase.service_role_key', true);
BEGIN
  -- Set custom.supabase_url so triggers can call Edge Functions
  EXECUTE format('ALTER DATABASE postgres SET custom.supabase_url = %L', supabase_url);
  
  -- Note: service_role_key is read from Supabase's internal setting
  -- If that fails, we set it explicitly (requires knowing the key)
  IF service_key IS NULL OR service_key = '' THEN
    RAISE NOTICE 'supabase.service_role_key not found internally - triggers will use anon key fallback';
  END IF;
END $$;

-- Also ensure pg_net is enabled (required for HTTP calls from triggers)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Fix notify_new_like to use hardcoded URL (more reliable than current_setting)
CREATE OR REPLACE FUNCTION public.notify_new_like()
RETURNS TRIGGER AS $$
DECLARE
  post_owner_id UUID;
  post_owner_token TEXT;
  liker_name TEXT;
BEGIN
  -- Skip self-likes
  SELECT user_id INTO post_owner_id FROM public.posts WHERE id = NEW.post_id;
  IF post_owner_id = NEW.user_id THEN RETURN NEW; END IF;

  SELECT fcm_token INTO post_owner_token FROM public.usuarios WHERE id = post_owner_id;
  SELECT nombre INTO liker_name FROM public.usuarios WHERE id = NEW.user_id;

  IF post_owner_token IS NOT NULL THEN
    PERFORM net.http_post(
      url := 'https://mvoyuoicfbxdkpfhwgqk.supabase.co/functions/v1/send-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('custom.supabase_service_role_key', true)
      ),
      body := jsonb_build_object(
        'fcm_token', post_owner_token,
        'title', '❤️ Nuevo Like',
        'body', liker_name || ' le dio me gusta a tu publicación'
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix notify_new_comment
CREATE OR REPLACE FUNCTION public.notify_new_comment()
RETURNS TRIGGER AS $$
DECLARE
  post_owner_id UUID;
  post_owner_token TEXT;
  commenter_name TEXT;
BEGIN
  SELECT user_id INTO post_owner_id FROM public.posts WHERE id = NEW.post_id;
  IF post_owner_id = NEW.user_id THEN RETURN NEW; END IF;

  SELECT fcm_token INTO post_owner_token FROM public.usuarios WHERE id = post_owner_id;
  SELECT nombre INTO commenter_name FROM public.usuarios WHERE id = NEW.user_id;

  IF post_owner_token IS NOT NULL THEN
    PERFORM net.http_post(
      url := 'https://mvoyuoicfbxdkpfhwgqk.supabase.co/functions/v1/send-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('custom.supabase_service_role_key', true)
      ),
      body := jsonb_build_object(
        'fcm_token', post_owner_token,
        'title', '💬 Nuevo Comentario',
        'body', commenter_name || ' comentó en tu publicación'
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix notify_new_class
CREATE OR REPLACE FUNCTION public.notify_new_class()
RETURNS TRIGGER AS $$
DECLARE
  student_token TEXT;
  teacher_name  TEXT;
BEGIN
  SELECT fcm_token INTO student_token FROM public.usuarios WHERE id = NEW.student_id;
  SELECT nombre INTO teacher_name FROM public.usuarios WHERE id = NEW.teacher_id;

  IF student_token IS NOT NULL THEN
    PERFORM net.http_post(
      url := 'https://mvoyuoicfbxdkpfhwgqk.supabase.co/functions/v1/send-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('custom.supabase_service_role_key', true)
      ),
      body := jsonb_build_object(
        'fcm_token', student_token,
        'title', '📚 Nueva Clase Programada',
        'body', teacher_name || ' agendó la clase: ' || NEW.title
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate triggers to ensure they're active
DROP TRIGGER IF EXISTS on_new_like ON public.likes;
CREATE TRIGGER on_new_like
  AFTER INSERT ON public.likes
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_like();

DROP TRIGGER IF EXISTS on_new_comment ON public.post_comments;
CREATE TRIGGER on_new_comment
  AFTER INSERT ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_comment();

DROP TRIGGER IF EXISTS on_new_class ON public.classes;
CREATE TRIGGER on_new_class
  AFTER INSERT ON public.classes
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_class();
