package com.smartune.app.core.network.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class Usuario(
    val id: String,
    val nombre: String,
    val correo: String,
    val rol: String = "estudiante",
    @SerialName("fecha_registro")
    val fechaRegistro: String? = null,
    @SerialName("estado_suscripcion")
    val estadoSuscripcion: String = "prueba",
    @SerialName("progreso_global")
    val progresoGlobal: Int = 0,
    @SerialName("avatar_url")
    val avatarUrl: String? = null
)
