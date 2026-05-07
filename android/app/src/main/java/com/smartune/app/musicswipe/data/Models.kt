package com.smartune.app.musicswipe.data

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class MusicSwipeSong(
    val id: String = "",
    val title: String = "",
    val artist: String = "",
    val coverUrl: String? = null
)

@Serializable
data class Favorito(
    val id: Int = 0,
    @SerialName("usuario_id") val usuarioId: String = "",
    @SerialName("youtube_id") val youtubeId: String = "",
    val titulo: String = "",
    val artista: String = "",
    @SerialName("cover_url") val coverUrl: String? = null,
    @SerialName("fecha_like") val fechaLike: String? = null
)
