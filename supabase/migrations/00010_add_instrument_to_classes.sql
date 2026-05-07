-- ==============================================
-- UPDATE CLASSES TABLE WITH INSTRUMENT
-- ==============================================

-- Añadir el campo de instrumento a la tabla de clases
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS instrument VARCHAR(255);
