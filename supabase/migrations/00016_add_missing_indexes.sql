-- Indice vital para acelerar las queries del motor de espaciado repetitivo (SRS)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_historial_usuario_id_practica 
ON public.historial_usuario (usuario_id, proxima_practica);

-- Indice para los filtrados constantes de catalogo y explorador de biblioteca
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_canciones_estado 
ON public.canciones (estado);

-- Indice para mejorar dramáticamente los ordenamientos de timeline general en "Recientes"
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_created_at_desc 
ON public.posts (created_at DESC);

-- Indice liviano para el limpiador de caché y lecturas selectivas del feed móvil/web de stories efímeros 
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_historias_expires_at 
ON public.historias (expires_at);
