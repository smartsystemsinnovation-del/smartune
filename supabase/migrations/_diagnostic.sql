-- DIAGNÓSTICO: Verifica si los usuarios tienen fcm_token guardado
-- Ejecuta esto en Supabase SQL Editor

-- 1. Ver si algún usuario tiene fcm_token
SELECT 
  id,
  nombre,
  correo,
  CASE WHEN fcm_token IS NULL THEN '❌ NULL (no token)' 
       ELSE '✅ ' || LEFT(fcm_token, 20) || '...' 
  END AS fcm_status
FROM public.usuarios
ORDER BY created_at DESC
LIMIT 10;

-- 2. Ver si los triggers existen
SELECT trigger_name, event_manipulation, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name IN ('on_new_like', 'on_new_comment', 'on_new_class')
ORDER BY trigger_name;

-- 3. Ver si pg_net está habilitado
SELECT * FROM pg_extension WHERE extname = 'pg_net';
