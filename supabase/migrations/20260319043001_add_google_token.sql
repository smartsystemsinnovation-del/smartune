-- Migration: add_google_token
-- Agregar columna para almacenar de forma segura el token maestro de Google (necesario para la persistencia del Calendar API)
ALTER TABLE public.usuarios 
ADD COLUMN IF NOT EXISTS google_refresh_token TEXT;
