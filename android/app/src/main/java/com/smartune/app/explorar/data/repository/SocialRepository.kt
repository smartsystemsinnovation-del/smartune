package com.smartune.app.explorar.data.repository

import com.smartune.app.core.supabase.SupabaseClient
import com.smartune.app.explorar.data.models.*
import io.github.jan.supabase.postgrest.postgrest
import io.github.jan.supabase.postgrest.query.Columns
import io.github.jan.supabase.storage.storage
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put

class SocialRepository {

    // ── Feed ──
    suspend fun getFeed(): List<Post> {
        return try {
            val userId = SupabaseClient.auth.currentSessionOrNull()?.user?.id ?: return emptyList()
            val result = SupabaseClient.client.postgrest.rpc("get_feed", buildJsonObject {
                put("requesting_user_id", userId)
            })
            result.decodeList<Post>()
        } catch (e: Exception) {
            // Fallback: direct query
            try {
                SupabaseClient.client.postgrest["publicaciones_feed"]
                    .select()
                    .decodeList<Post>()
            } catch (_: Exception) {
                emptyList()
            }
        }
    }

    // ── Create Post ──
    suspend fun createPost(content: String, imageBytes: ByteArray? = null, imageName: String? = null): Boolean {
        return try {
            val userId = SupabaseClient.auth.currentSessionOrNull()?.user?.id ?: return false
            var imageUrl: String? = null

            if (imageBytes != null && imageName != null) {
                val path = "$userId/${System.currentTimeMillis()}_$imageName"
                SupabaseClient.client.storage.from("publicaciones").upload(path, imageBytes)
                imageUrl = SupabaseClient.client.storage.from("publicaciones").publicUrl(path)
            }

            SupabaseClient.client.postgrest["publicaciones"].insert(buildJsonObject {
                put("user_id", userId)
                put("content", content)
                if (imageUrl != null) put("image_url", imageUrl)
            })
            true
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }

    // ── Likes ──
    suspend fun toggleLike(postId: String, currentlyLiked: Boolean): Boolean {
        return try {
            val userId = SupabaseClient.auth.currentSessionOrNull()?.user?.id ?: return false
            if (currentlyLiked) {
                SupabaseClient.client.postgrest["likes"].delete {
                    filter { eq("publicacion_id", postId); eq("user_id", userId) }
                }
            } else {
                SupabaseClient.client.postgrest["likes"].insert(buildJsonObject {
                    put("publicacion_id", postId)
                    put("user_id", userId)
                })
            }
            true
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }

    // ── Comments ──
    suspend fun getComments(postId: String): List<Comment> {
        return try {
            SupabaseClient.client.postgrest["comentarios"]
                .select(Columns.raw("*, usuarios(nombre, avatar_url)")) {
                    filter { eq("publicacion_id", postId) }
                    order("created_at", io.github.jan.supabase.postgrest.query.Order.ASCENDING)
                }
                .decodeList<Comment>()
        } catch (e: Exception) {
            emptyList()
        }
    }

    suspend fun addComment(postId: String, content: String): Boolean {
        return try {
            val userId = SupabaseClient.auth.currentSessionOrNull()?.user?.id ?: return false
            SupabaseClient.client.postgrest["comentarios"].insert(buildJsonObject {
                put("publicacion_id", postId)
                put("user_id", userId)
                put("content", content)
            })
            true
        } catch (e: Exception) {
            false
        }
    }

    // ── Profile ──
    suspend fun getProfile(): UserProfile? {
        return try {
            val userId = SupabaseClient.auth.currentSessionOrNull()?.user?.id ?: return null
            SupabaseClient.client.postgrest["usuarios"]
                .select { filter { eq("id", userId) } }
                .decodeSingle<UserProfile>()
        } catch (e: Exception) {
            null
        }
    }

    suspend fun updateProfile(nombre: String, avatarBytes: ByteArray? = null, avatarName: String? = null): Boolean {
        return try {
            val userId = SupabaseClient.auth.currentSessionOrNull()?.user?.id ?: return false
            var avatarUrl: String? = null

            if (avatarBytes != null && avatarName != null) {
                val path = "$userId/avatar_${System.currentTimeMillis()}.${avatarName.substringAfterLast('.')}"
                SupabaseClient.client.storage.from("avatars").upload(path, avatarBytes, upsert = true)
                avatarUrl = SupabaseClient.client.storage.from("avatars").publicUrl(path)
            }

            SupabaseClient.client.postgrest["usuarios"].update(buildJsonObject {
                put("nombre", nombre)
                if (avatarUrl != null) put("avatar_url", avatarUrl)
            }) { filter { eq("id", userId) } }
            true
        } catch (e: Exception) {
            false
        }
    }

    // ── Profesores ──
    suspend fun getProfesores(): List<Profesor> {
        return try {
            SupabaseClient.client.postgrest["usuarios"]
                .select { filter { eq("profesor_aprobado", true) } }
                .decodeList<Profesor>()
        } catch (e: Exception) {
            emptyList()
        }
    }

    // ── Clases ──
    suspend fun getMisClases(): List<ClaseAgendada> {
        return try {
            val userId = SupabaseClient.auth.currentSessionOrNull()?.user?.id ?: return emptyList()
            SupabaseClient.client.postgrest["clases"]
                .select {
                    filter {
                        or {
                            eq("alumno_id", userId)
                            eq("profesor_id", userId)
                        }
                    }
                    order("fecha_inicio", io.github.jan.supabase.postgrest.query.Order.ASCENDING)
                }
                .decodeList<ClaseAgendada>()
        } catch (e: Exception) {
            emptyList()
        }
    }

    suspend fun crearClase(titulo: String, alumnoId: String, fechaInicio: String, fechaFin: String): Boolean {
        return try {
            val userId = SupabaseClient.auth.currentSessionOrNull()?.user?.id ?: return false
            SupabaseClient.client.postgrest["clases"].insert(buildJsonObject {
                put("titulo", titulo)
                put("profesor_id", userId)
                put("alumno_id", alumnoId)
                put("fecha_inicio", fechaInicio)
                put("fecha_fin", fechaFin)
            })
            true
        } catch (e: Exception) {
            false
        }
    }
}
