# Documento de Requerimientos del Sistema - SmarTune

## 1. Introducción
SmarTune es una plataforma integral de descubrimiento y práctica musical que combina tecnología de inteligencia artificial, gamificación y una experiencia de usuario fluida tanto en entorno web como móvil. El sistema permite a los usuarios explorar música, practicar instrumentos, interactuar con profesores y disfrutar de minijuegos educativos.

## 2. Arquitectura del Sistema
El sistema sigue una arquitectura distribuida con un backend unificado en Supabase:
- **Frontend Web**: Desarrollado con Next.js (App Router), React 19 y TypeScript.
- **Aplicación Móvil**: Nativa para Android utilizando Kotlin y Jetpack Compose.
- **Backend (BaaS)**: Supabase para autenticación, base de datos (PostgreSQL), almacenamiento y funciones serverless.
- **Integraciones**: Spotify API para gestión de música y metadatos.

## 3. Requerimientos Funcionales

### 3.1 Módulo Web
- **Autenticación**: Registro e inicio de sesión con correo electrónico, contraseña y Google Auth (OAuth). Recuperación de contraseña.
- **Dashboard**: Panel principal con resumen de actividad, recomendaciones y novedades.
- **Explorar**: Buscador de música y artistas utilizando la API de Spotify.
- **IA-Studio**: Herramientas basadas en IA para análisis o generación de contenido musical.
- **Gestión de Playlists**: Creación, edición y eliminación de listas de reproducción personalizadas.
- **Módulo de Práctica**: Herramientas interactivas para el aprendizaje musical.
- **Tienda/Premium**: Gestión de suscripciones y acceso a contenido exclusivo.
- **Minijuegos**: Juegos educativos como "Smar-Tiles" para mejorar habilidades rítmicas o melódicas.
- **Directorio de Profesores**: Conexión entre alumnos y tutores musicales.

### 3.2 Módulo Móvil (Android)
- **Sincronización de Perfil**: Acceso a la misma cuenta y datos que en la versión web a través de Supabase.
- **Reproducción de Medios**: Reproductor nativo integrado (ExoPlayer) para streaming de audio.
- **Music Swipe**: Interfaz de descubrimiento tipo "swipe" (similar a Tinder) para encontrar nueva música rápidamente.
- **Navegación Fluida**: Interfaz optimizada para móviles con Navigation Compose.
- **Notificaciones Push**: Alertas de novedades, recordatorios de práctica y mensajes de profesores.
- **Modo Offline**: Almacenamiento local de ciertos datos para consulta sin conexión (Cache).

## 4. Requerimientos No Funcionales
- **Rendimiento**: La web debe cargar en menos de 2 segundos (Vercel optimization). La app móvil debe mantener 60 FPS en animaciones.
- **Seguridad**: Implementación de Row Level Security (RLS) en Supabase para proteger los datos de usuario.
- **Escalabilidad**: Uso de infraestructura Serverless para manejar picos de tráfico.
- **Usabilidad**: Diseño responsivo y adaptable (Mobile-first en web, Material Design 3 en Android).
- **Disponibilidad**: Garantizar un uptime del 99.9% mediante el uso de servicios cloud comerciales (Vercel, Supabase).

## 5. Stack Tecnológico

### Web
- **Core**: Next.js 16.1+, React 19.
- **Estilos**: Tailwind CSS 4, PostCSS.
- **Iconografía/Fuentes**: Lucide React, Geist Sans.
- **Analytics**: Vercel Analytics.

### Móvil (Android)
- **Lenguaje**: Kotlin 1.9+.
- **UI**: Jetpack Compose con Material 3.
- **Networking**: Ktor Client.
- **Carga de Imágenes**: Coil.
- **Media**: Media3 (ExoPlayer).

### Backend & Común
- **Base de Datos**: PostgreSQL (Supabase).
- **Auth**: Supabase Auth (GoTrue).
- **Storage**: Supabase Storage para avatares y recursos.
- **Funciones**: Supabase Edge Functions.

## 6. Modelo de Datos (Esquema Principal)
- **users**: Perfiles de usuario, metadata y preferencias.
- **playlists**: Metadatos de las listas y relación con usuarios.
- **onboarding**: Estado del proceso de bienvenida del usuario.
- **auth/social**: Vínculos con proveedores externos (Google/Spotify).
