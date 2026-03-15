-- ==========================================
-- SMARTUNE: INITIAL SCHEMA MIGRATION
-- ==========================================

-- Habilitar extensión pgcrypto para UUIDs seguros si fuese necesario, aunque referenciamos a auth.uid()
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. TABLAS PRINCIPALES
-- ==========================================

-- Tabla: usuarios
CREATE TABLE public.usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    rol VARCHAR(20) CHECK (rol IN ('estudiante', 'profesor', 'administrador')) DEFAULT 'estudiante',
    fecha_registro DATE DEFAULT CURRENT_DATE,
    estado_suscripcion VARCHAR(20) CHECK (estado_suscripcion IN ('gratis', 'prueba', 'premium', 'vencida')) DEFAULT 'prueba',
    progreso_global INT DEFAULT 0
);

-- Tabla: suscripciones
CREATE TABLE public.suscripciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    tipo VARCHAR(20) CHECK (tipo IN ('prueba', 'premium')) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    estado VARCHAR(20) CHECK (estado IN ('activa', 'vencida')) DEFAULT 'activa'
);

-- Tabla: profesores
CREATE TABLE public.profesores (
    id UUID PRIMARY KEY REFERENCES public.usuarios(id) ON DELETE CASCADE,
    certificaciones TEXT,
    experiencia TEXT,
    estado_verificacion VARCHAR(20) CHECK (estado_verificacion IN ('pendiente', 'verificado', 'rechazado')) DEFAULT 'pendiente'
);

-- Tabla: profesor_alumno
CREATE TABLE public.profesor_alumno (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profesor_id UUID REFERENCES public.profesores(id) ON DELETE CASCADE,
    alumno_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    fecha_inicio DATE NOT NULL,
    costo_extra DECIMAL(8,2) DEFAULT 0.00,
    estado VARCHAR(20) CHECK (estado IN ('activo', 'cancelado')) DEFAULT 'activo'
);

-- Tabla: canciones
CREATE TABLE public.canciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    autor_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    titulo VARCHAR(150) NOT NULL,
    artista VARCHAR(150),
    dificultad VARCHAR(20) CHECK (dificultad IN ('basico', 'intermedio', 'avanzado')),
    estado VARCHAR(20) CHECK (estado IN ('activa', 'eliminada', 'pendiente')) DEFAULT 'activa',
    votos_positivos INT DEFAULT 0,
    votos_negativos INT DEFAULT 0,
    fecha_subida DATE DEFAULT CURRENT_DATE
);

-- Tabla: cancion_archivos
CREATE TABLE public.cancion_archivos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cancion_id UUID REFERENCES public.canciones(id) ON DELETE CASCADE,
    autor_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    tipo_archivo VARCHAR(20) CHECK (tipo_archivo IN ('tab', 'audio', 'video')),
    url_archivo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha_subida DATE DEFAULT CURRENT_DATE
);

-- Tabla: historial_usuario (Con Spaced Repetition System - Ebbinghaus)
CREATE TABLE public.historial_usuario (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    cancion_id UUID REFERENCES public.canciones(id) ON DELETE CASCADE,
    fecha_practica TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    progreso INT DEFAULT 0, -- Porcentaje o puntos en la sesión
    minijuego_resultado INT,
    
    -- Algoritmo SRS (SuperMemo-2 / Ebbinghaus Forgetting Curve)
    repeticiones INT DEFAULT 0,
    intervalo REAL DEFAULT 0, -- Días hasta la próxima práctica
    factor_facilidad REAL DEFAULT 2.5,
    proxima_practica TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: comentarios
CREATE TABLE public.comentarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    cancion_id UUID REFERENCES public.canciones(id) ON DELETE CASCADE,
    texto TEXT NOT NULL,
    fecha_comentario TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    moderado BOOLEAN DEFAULT false
);

-- Tabla: tips_profesor
CREATE TABLE public.tips_profesor (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profesor_id UUID REFERENCES public.profesores(id) ON DELETE CASCADE,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT NOT NULL,
    estrellas INT CHECK (estrellas BETWEEN 1 AND 5),
    fecha DATE DEFAULT CURRENT_DATE
);

-- ==========================================
-- 2. ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suscripciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profesores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profesor_alumno ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.canciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cancion_archivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historial_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comentarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tips_profesor ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------
-- Políticas para USUARIOS
-- ------------------------------------------
CREATE POLICY "Public profiles are viewable by everyone" ON public.usuarios
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.usuarios
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.usuarios
    FOR UPDATE USING (auth.uid() = id);

-- ------------------------------------------
-- Políticas para HISTORIAL_USUARIO
-- ------------------------------------------
CREATE POLICY "Users can view their own history" ON public.historial_usuario
    FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Users can insert their own history" ON public.historial_usuario
    FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update their own history" ON public.historial_usuario
    FOR UPDATE USING (auth.uid() = usuario_id);

-- ------------------------------------------
-- Políticas para CANCIONES
-- ------------------------------------------
CREATE POLICY "Activa songs are viewable by everyone" ON public.canciones
    FOR SELECT USING (estado = 'activa');

CREATE POLICY "Autors can insert songs (pendientes)" ON public.canciones
    FOR INSERT WITH CHECK (auth.uid() = autor_id AND estado = 'pendiente');

CREATE POLICY "Autors can view their own songs regardless of status" ON public.canciones
    FOR SELECT USING (auth.uid() = autor_id);

-- ------------------------------------------
-- Políticas para PROFESORES
-- ------------------------------------------
CREATE POLICY "Verified professors are viewable by everyone" ON public.profesores
    FOR SELECT USING (estado_verificacion = 'verificado');

CREATE POLICY "Users can view their own professor profile" ON public.profesores
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own certification (triggers pending)" ON public.profesores
    FOR UPDATE USING (auth.uid() = id);

-- ------------------------------------------
-- Bypass para Administradores
-- (Uso de una función segura que chequee el rol sin generar recursión infinita en políticas de tabla)
-- ------------------------------------------
CREATE OR REPLACE FUNCTION es_admin() RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.usuarios 
    WHERE id = auth.uid() AND rol = 'administrador'
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE POLICY "Admins bypass RLS - Usuarios" ON public.usuarios FOR ALL USING (es_admin());
CREATE POLICY "Admins bypass RLS - Canciones" ON public.canciones FOR ALL USING (es_admin());
CREATE POLICY "Admins bypass RLS - Comentarios" ON public.comentarios FOR ALL USING (es_admin());
CREATE POLICY "Admins bypass RLS - Profesores" ON public.profesores FOR ALL USING (es_admin());

-- FIN MIGRACIÓN
