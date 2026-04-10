package com.smartune.app.core.network.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class Cancion(
    val id: String,
    @SerialName("autor_id")
    val autorId: String,
    val titulo: String,
    val artista: String? = null,
    val dificultad: String? = null,
    val estado: String = "activa",
    @SerialName("votos_positivos")
    val votosPositivos: Int = 0,
    @SerialName("votos_negativos")
    val votosNegativos: Int = 0,
    @SerialName("fecha_subida")
    val fechaSubida: String? = null,
    val coverUrl: String? = null,
    val previewUrl: String? = null
)
