package com.smartune.app.core.network.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class Post(
    val id: String,
    @SerialName("user_id")
    val userId: String,
    val content: String,
    @SerialName("image_url")
    val imageUrl: String? = null,
    @SerialName("created_at")
    val createdAt: String? = null
)
