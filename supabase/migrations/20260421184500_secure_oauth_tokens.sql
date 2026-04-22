-- Migration: secure_oauth_tokens
-- Move google_refresh_token to a private table protected by RLS

CREATE SCHEMA IF NOT EXISTS private;

CREATE TABLE private.oauth_tokens (
    user_id UUID PRIMARY KEY REFERENCES public.usuarios(id) ON DELETE CASCADE,
    google_refresh_token TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migrate existing data
INSERT INTO private.oauth_tokens (user_id, google_refresh_token)
SELECT id, google_refresh_token FROM public.usuarios
WHERE google_refresh_token IS NOT NULL;

-- Remove the unsafe column
ALTER TABLE public.usuarios DROP COLUMN google_refresh_token;

-- Enable RLS
ALTER TABLE private.oauth_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own token" ON private.oauth_tokens
    FOR ALL TO authenticated USING (auth.uid() = user_id);
