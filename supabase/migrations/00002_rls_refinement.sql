-- ==========================================
-- SMARTUNE: RLS REFINEMENT
-- ==========================================

-- 1. Asegurar que estudiantes solon vean canciones aprobadas (activa)
-- Como las políticas por defecto acumulan de tipo OR, reescribiremos DROP de la anterior si es necesario.
DROP POLICY IF EXISTS "Activa songs are viewable by everyone" ON public.canciones;

CREATE POLICY "Activa songs are viewable by everyone" ON public.canciones
    FOR SELECT USING (estado = 'activa');
-- Se mantiene: los estudiantes (y public) ven solo 'activa'.
-- Los autores ven las suyas (Política previa 'Autors can view their own songs').

-- 2. Modificar cancion_archivos para tener un campo de estado para aprobaciones
ALTER TABLE public.cancion_archivos ADD COLUMN IF NOT EXISTS estado VARCHAR(20) CHECK (estado IN ('activa', 'pendiente', 'rechazada')) DEFAULT 'pendiente';

-- 3. RLS para cancion_archivos
DROP POLICY IF EXISTS "Archivos activos viewable" ON public.cancion_archivos;

CREATE POLICY "Archivos activos viewable" ON public.cancion_archivos
    FOR SELECT USING (estado = 'activa');

-- Los profesores (o el autor) pueden subir archivos, forzando a 'pendiente'
CREATE POLICY "Autors can upload archivos" ON public.cancion_archivos
    FOR INSERT WITH CHECK (auth.uid() = autor_id AND estado = 'pendiente');

CREATE POLICY "Autors can view own archivos" ON public.cancion_archivos
    FOR SELECT USING (auth.uid() = autor_id);

-- 4. Asegurarnos que los Admins puedan ver y actualizar todo
CREATE POLICY "Admins bypass RLS - cancion_archivos" ON public.cancion_archivos FOR ALL USING (es_admin());
