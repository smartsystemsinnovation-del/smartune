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

    // Sub-screens
    const val PROFESOR_DETAIL = "profesor/{profesorId}"
    const val HAZTE_PROFESOR = "hazte-profesor"
    const val TEACHER_DASHBOARD = "teacher/dashboard"
    const val CREAR_CLASE = "teacher/clases/crear"
    const val PREMIUM = "premium"
    const val MINIJUEGOS = "minijuegos"
    const val NOVEDADES = "novedades"
    const val PLAYLIST = "playlist"
    const val PLAYLIST_CREAR = "playlist/crear"

    fun profesorDetail(id: String) = "profesor/$id"
}
