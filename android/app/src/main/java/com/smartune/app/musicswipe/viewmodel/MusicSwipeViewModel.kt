package com.smartune.app.musicswipe.viewmodel

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.smartune.app.core.supabase.SupabaseClient
import com.smartune.app.musicswipe.data.MusicSwipeSong
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.engine.android.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.coroutines.launch
import kotlinx.serialization.json.Json
import kotlinx.serialization.Serializable
import io.github.jan.supabase.postgrest.from

@Serializable
data class SupabaseFavorito(
    val usuario_id: String,
    val youtube_id: String,
    val titulo: String,
    val artista: String,
    val cover_url: String?
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

    init {
        fetchSongs()
    }

    fun fetchSongs() {
        viewModelScope.launch {
            isLoading = true
            error = null
            try {
                // Fetch directly from the Next.js API, which returns Array<Song>
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
        }

        if (songs.size <= 3) {
            fetchMoreSongs()
        }
    }

    private fun fetchMoreSongs() {
        viewModelScope.launch {
            try {
                val newSongs: List<MusicSwipeSong> = client.get("$BASE_URL/api/songs").body()
                val uniqueNew = newSongs.filter { newSong -> songs.none { it.id == newSong.id } }
                songs = songs + uniqueNew
            } catch (e: Exception) {
                // Silently fail if pagination fails
            }
        }
    }

    private fun saveToFavorites(song: MusicSwipeSong) {
        viewModelScope.launch {
            try {
                val userId = SupabaseClient.auth.currentSessionOrNull()?.user?.id ?: return@launch
                
                SupabaseClient.client.from("favoritos").upsert(
                    SupabaseFavorito(
                        usuario_id = userId,
                        youtube_id = song.id,
                        titulo = song.title,
                        artista = song.artist,
                        cover_url = song.coverUrl
                    )
                )
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    override fun onCleared() {
        super.onCleared()
        client.close()
    }
}
