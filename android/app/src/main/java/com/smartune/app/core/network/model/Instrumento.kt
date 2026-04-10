package com.smartune.app.core.network.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class Instrumento(
    val id: String,
    val nombre: String,
    @SerialName("imagen_url")
    val imagenUrl: String? = null,
    @SerialName("total_alumnos")
    val totalAlumnos: Int = 0,
    @SerialName("total_profesores")
    val totalProfesores: Int = 0,
    val categoria: String? = null
)
