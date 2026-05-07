package com.smartune.app.musicswipe.viewmodel

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.smartune.app.core.supabase.SupabaseClient
import com.smartune.app.musicswipe.data.MusicSwipeSong
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.query.Columns
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.engine.android.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.coroutines.launch
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

@Serializable
data class SupabaseFavorito(
    @SerialName("usuario_id") val usuario_id: String,
    @SerialName("youtube_id") val youtube_id: String,
    @SerialName("titulo") val titulo: String,
    @SerialName("artista") val artista: String,
    @SerialName("cover_url") val cover_url: String?
)

class MusicSwipeViewModel : ViewModel() {
    private val BASE_URL = "https://smar-tune.vercel.app"

    private val client = HttpClient(Android) {
        install(ContentNegotiation) {
            json(Json {
                ignoreUnknownKeys = true
                isLenient = true
            })
        }
    }

    var songs by mutableStateOf<List<MusicSwipeSong>>(emptyList())
    var isLoading by mutableStateOf(true)
    var error by mutableStateOf<String?>(null)
    var likeCount by mutableStateOf(0)

    init {
        fetchSongs()
    }

    fun fetchSongs() {
        viewModelScope.launch {
            isLoading = true
            error = null
            try {
                val fetchedSongs: List<MusicSwipeSong> = client.get("$BASE_URL/api/songs").body()
                songs = fetchedSongs
            } catch (e: Exception) {
                error = "Error al obtener música: ${e.message}"
            } finally {
                isLoading = false
            }
        }
    }

    fun swipeCurrent(isLike: Boolean) {
        if (songs.isEmpty()) return
        val currentSong = songs.first()
        songs = songs.drop(1)

        if (isLike) {
            saveToFavorites(currentSong)
            likeCount++
        }

        if (songs.size <= 3) {
            fetchMoreSongs()
        }
    }

    private fun fetchMoreSongs() {
        viewModelScope.launch {
            try {
                val newSongs: List<MusicSwipeSong> = client.get("$BASE_URL/api/songs").body()
                val currentIds = songs.map { it.id }.toSet()
                val uniqueNew = newSongs.filter { it.id !in currentIds }
                songs = songs + uniqueNew
            } catch (e: Exception) {
                // Silently fail
            }
        }
    }

    private fun saveToFavorites(song: MusicSwipeSong) {
        viewModelScope.launch {
            try {
                val userId = SupabaseClient.auth.currentSessionOrNull()?.user?.id
                if (userId == null) {
                    error = "Debes iniciar sesión para guardar favoritos"
                    return@launch
                }

                SupabaseClient.client.from("favoritos").upsert(
                    value = SupabaseFavorito(
                        usuario_id = userId,
                        youtube_id = song.id,
                        titulo = song.title,
                        artista = song.artist,
                        cover_url = song.coverUrl
                    ),
                    onConflict = "usuario_id,youtube_id"
                )
            } catch (e: Exception) {
                e.printStackTrace()
                error = "No se pudo guardar en favoritos: ${e.message}"
            }
        }
    }

    override fun onCleared() {
        super.onCleared()
        client.close()
    }
}
