package com.smartune.app.core.network.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class HistorialUsuario(
    val id: String,
    @SerialName("usuario_id")
    val usuarioId: String,
    @SerialName("cancion_id")
    val cancionId: String,
    @SerialName("fecha_practica")
    val fechaPractica: String? = null,
    val progreso: Int = 0,
    @SerialName("minijuego_resultado")
    val minijuegoResultado: Int? = null,
    val repeticiones: Int = 0,
    val intervalo: Float = 0f,
    @SerialName("factor_facilidad")
    val factorFacilidad: Float = 2.5f,
    @SerialName("proxima_practica")
    val proximaPractica: String? = null
)
