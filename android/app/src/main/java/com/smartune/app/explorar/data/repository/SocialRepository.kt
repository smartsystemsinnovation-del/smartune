package com.smartune.app.explorar.data.repository

import com.smartune.app.core.supabase.SupabaseClient
import com.smartune.app.explorar.data.models.*
import io.github.jan.supabase.postgrest.postgrest
import io.github.jan.supabase.postgrest.query.Columns
import io.github.jan.supabase.postgrest.rpc
import io.github.jan.supabase.storage.storage
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.jsonPrimitive

class SocialRepository {

    suspend fun syncUserProfile(): String? {
        return try {
            // Actively check the session status flow
            val status = SupabaseClient.auth.sessionStatus.value
            val session = when (status) {
                is io.github.jan.supabase.gotrue.SessionStatus.Authenticated -> status.session
                else -> null
            }
            
            var user = session?.user
            if (user == null) {
                try { SupabaseClient.auth.loadFromStorage() } catch (_: Exception) {}
                val updatedStatus = SupabaseClient.auth.sessionStatus.value
                val updatedSession = when (updatedStatus) {
                    is io.github.jan.supabase.gotrue.SessionStatus.Authenticated -> updatedStatus.session
                    else -> null
                }
                user = updatedSession?.user
                if (user == null) {
                    val statusName = updatedStatus::class.simpleName ?: "Unknown"
                    return "Sin sesión activa (Status: $statusName)"
                }
            }

            // 1. Check if user already exists — if yes, skip insert entirely
            val existing = SupabaseClient.client.postgrest["usuarios"]
                .select(Columns.list("id")) {
                    filter { eq("id", user.id) }
                }
                .data  // raw JSON string
            if (existing != "[]" && existing.isNotEmpty()) return null

            // 2. User not found → build profile data
            val metadata = user.userMetadata
            val name = metadata?.get("full_name")?.jsonPrimitive?.content
                ?: metadata?.get("name")?.jsonPrimitive?.content
                ?: user.email?.substringBefore('@')
                ?: "Usuario SmarTune"
            val correo = user.email ?: "${user.id}@smartune.app"
            val avatar = metadata?.get("avatar_url")?.jsonPrimitive?.content
                ?: metadata?.get("picture")?.jsonPrimitive?.content
                ?: "https://ui-avatars.com/api/?background=0D0D0D&color=F2359D&bold=true&name=${name.replace(" ", "+")}"

            // 3. INSERT — if another thread already inserted, the duplicate exception is ignored
            try {
                SupabaseClient.client.postgrest["usuarios"].insert(
                    buildJsonObject {
                        put("id", user.id)
                        put("nombre", name)
                        put("correo", correo)
                        put("avatar_url", avatar)
                    }
                )
            } catch (dup: Exception) {
                // Duplicate key = already exists, that's fine
                val msg = dup.message.orEmpty()
                if (!msg.contains("duplicate") && !msg.contains("unique") && !msg.contains("23505")) {
                    return "Error al crear perfil: $msg"
                }
            }
            null // success
        } catch (e: Exception) {
            e.printStackTrace()
            e.message
        }
    }

    // ── Feed ──
    suspend fun getFeed(): List<Post> {
        val userId = SupabaseClient.auth.currentSessionOrNull()?.user?.id
        return try {
            // 1. Fetch posts from vw_posts_with_details
            val rawPosts = SupabaseClient.client.postgrest["vw_posts_with_details"]
                .select {
                    order("created_at", io.github.jan.supabase.postgrest.query.Order.DESCENDING)
                    limit(50)
                }
                .decodeList<Post>()

            // 2. Fetch user's likes
            val likedPostIds = if (userId != null) {
                val userLikes = SupabaseClient.client.postgrest["likes"]
                    .select(Columns.list("post_id")) {
                        filter { eq("user_id", userId) }
                    }
                    .decodeList<JsonObject>()
                userLikes.mapNotNull { it["post_id"]?.jsonPrimitive?.content }.toSet()
            } else {
                emptySet()
            }

            // 3. Map hasLiked
            rawPosts.map { post ->
                post.copy(hasLiked = likedPostIds.contains(post.id))
            }
        } catch (e: Exception) {
            e.printStackTrace()
            listOf(Post(id = "error", content = "Exception: ${e.message}", username = "Debugger", createdAt = "Now"))
        }
    }

    // ── Create Post ──
    suspend fun createPost(content: String, imageBytes: ByteArray? = null, imageName: String? = null): String? {
        // sync user first — returns error string if fails
        val syncError = syncUserProfile()
        if (syncError != null) return "Perfil no sincronizado: $syncError"
        
        return try {
            val userId = SupabaseClient.auth.currentSessionOrNull()?.user?.id 
                ?: return "Sesión no encontrada. Vuelve a iniciar sesión."
            var imageUrl: String? = null

            if (imageBytes != null && imageName != null) {
                val path = "$userId/${System.currentTimeMillis()}_$imageName"
                SupabaseClient.client.storage.from("posts_images").upload(path, imageBytes)
                imageUrl = SupabaseClient.client.storage.from("posts_images").publicUrl(path)
            }

            SupabaseClient.client.postgrest["posts"].insert(buildJsonObject {
                put("user_id", userId)
                put("content", content)
                if (imageUrl != null) put("image_url", imageUrl)
            })
            null // success
        } catch (e: Exception) {
            e.printStackTrace()
            "DB Error: ${e.message}"
        }
    }

    // ── Likes ──
    suspend fun toggleLike(postId: String, currentlyLiked: Boolean): Boolean {
        syncUserProfile()
        return try {
            val userId = SupabaseClient.auth.currentSessionOrNull()?.user?.id ?: return false
            if (currentlyLiked) {
                // Remove like
                SupabaseClient.client.postgrest["likes"].delete {
                    filter { eq("post_id", postId); eq("user_id", userId) }
                }
            } else {
                // Add like
                SupabaseClient.client.postgrest["likes"].insert(buildJsonObject {
                    put("post_id", postId)
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
                    filter { eq("target_id", postId); eq("target_type", "post") }
                    order("created_at", io.github.jan.supabase.postgrest.query.Order.ASCENDING)
                }
                .decodeList<Comment>()
        } catch (e: Exception) {
            e.printStackTrace()
            listOf(Comment(id = "error", content = "Error: ${e.message}", usuarios = com.smartune.app.explorar.data.models.CommentUser(nombre = "Debug")))
        }
    }

    suspend fun addComment(postId: String, content: String): Boolean {
        syncUserProfile()
        return try {
            val userId = SupabaseClient.auth.currentSessionOrNull()?.user?.id ?: return false
            SupabaseClient.client.postgrest["comentarios"].insert(buildJsonObject {
                put("target_id", postId)
                put("target_type", "post")
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
        syncUserProfile()
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

    // ── Player Progress Sync ──
    suspend fun markLessonCompleted(lessonId: String): Boolean {
        return try {
            val userId = SupabaseClient.auth.currentSessionOrNull()?.user?.id ?: return false
            // Call Postgres RPC or direct insert to user_progress
            SupabaseClient.client.postgrest["user_progress"].insert(buildJsonObject {
                put("user_id", userId)
                put("recurso_id", lessonId)
                put("completado", true)
            })
            true
        } catch (e: Exception) {
            false
        }
    }
}
