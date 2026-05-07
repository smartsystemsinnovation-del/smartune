package com.smartune.app.core.navigation

object Routes {
    const val LOGIN = "login"
    const val ONBOARDING = "onboarding"

    // Main tabs
    const val HOME = "home"
    const val EXPLORAR = "explorar"
    const val FAVORITOS = "favoritos"
    const val PROFESORES = "profesores"
    const val PROFILE = "profile"
    const val PUBLIC_PROFILE = "public_profile/{userId}"
    fun publicProfile(id: String) = "public_profile/$id"

    // Sub-screens
    const val PROFESOR_DETAIL = "profesor/{profesorId}"
    const val HAZTE_PROFESOR = "hazte-profesor"
    const val TEACHER_DASHBOARD = "teacher/dashboard"
    const val CREAR_CLASE = "teacher/clases/crear"
    const val PREMIUM = "premium"
    const val MINIJUEGOS = "minijuegos"
    const val SMAR_TILES = "smar-tiles"
    const val IA_STUDIO = "ia-studio"
    const val NOVEDADES = "novedades"
    const val PLAYLIST = "playlist"
    const val PLAYLIST_CREAR = "playlist/crear"

    fun profesorDetail(id: String) = "profesor/$id"
    
    const val COURSE_DETAIL = "course/{courseId}"
    fun courseDetail(id: String) = "course/$id"
    
    const val PLAYER = "player/{lessonId}"
    fun player(id: String) = "player/$id"
}
