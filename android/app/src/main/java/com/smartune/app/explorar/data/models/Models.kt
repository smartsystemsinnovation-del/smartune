package com.smartune.app.explorar.data.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class Post(
    val id: String = "",
    @SerialName("user_id") val userId: String = "",
    val content: String = "",
    @SerialName("image_url") val imageUrl: String? = null,
    @SerialName("created_at") val createdAt: String = "",
    val username: String? = null,
    @SerialName("avatar_url") val avatarUrl: String? = null,
    val rol: String? = null,
    @SerialName("audio_url") val audioUrl: String? = null,
    @SerialName("likes_count") val likesCount: Int = 0,
    @SerialName("comments_count") val commentsCount: Int = 0,
    @SerialName("hasLiked") val hasLiked: Boolean = false
)

@Serializable
data class Comment(
    val id: String = "",
    val content: String = "",
    @SerialName("created_at") val createdAt: String = "",
    val usuarios: CommentUser? = null
)

@Serializable
data class CommentUser(
    val nombre: String = "",
    @SerialName("avatar_url") val avatarUrl: String? = null
)

@Serializable
data class StoryGroup(
    val userId: String = "",
    val nombre: String = "",
    @SerialName("avatar_url") val avatarUrl: String = "",
    val stories: List<StoryItem> = emptyList(),
    val isOwn: Boolean = false
)

@Serializable
data class StoryItem(
    val id: String = "",
    @SerialName("media_url") val mediaUrl: String = "",
    @SerialName("created_at") val createdAt: String = ""
)

@Serializable
data class Profesor(
    val id: String = "",
    val nombre: String = "",
    @SerialName("avatar_url") val avatarUrl: String? = null,
    val instrumento: String? = null,
    val bio: String? = null,
    @SerialName("precio_por_hora") val precioPorHora: Double? = null,
    val rating: Double? = null,
    @SerialName("total_clases") val totalClases: Int = 0
)

@Serializable
data class ClaseAgendada(
    val id: String = "",
    val titulo: String = "",
    @SerialName("profesor_nombre") val profesorNombre: String = "",
    @SerialName("alumno_nombre") val alumnoNombre: String = "",
    @SerialName("meet_link") val meetLink: String? = null,
    @SerialName("fecha_inicio") val fechaInicio: String = "",
    @SerialName("fecha_fin") val fechaFin: String = "",
    val estado: String = "pendiente"
)

@Serializable
data class UserProfile(
    val id: String = "",
    val nombre: String = "",
    val email: String = "",
    @SerialName("avatar_url") val avatarUrl: String? = null,
    val rol: String = "alumno",
    val instrumento: String? = null,
    @SerialName("gustos_musicales") val gustosMusicales: List<String>? = null,
    @SerialName("profesor_aprobado") val profesorAprobado: Boolean = false,
    @SerialName("created_at") val createdAt: String = ""
)
