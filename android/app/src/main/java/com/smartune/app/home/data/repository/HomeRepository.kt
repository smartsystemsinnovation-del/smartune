package com.smartune.app.home.data.repository

import com.smartune.app.core.network.model.Cancion
import com.smartune.app.core.network.model.Instrumento
import com.smartune.app.core.supabase.SupabaseClient
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.query.Columns
import io.github.jan.supabase.postgrest.query.Order
import io.ktor.client.HttpClient
import io.ktor.client.engine.android.Android
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.request.get
import io.ktor.client.call.body
import io.ktor.serialization.kotlinx.json.json
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

@Serializable
data class YoutubeSearchResponse(val items: List<YoutubeItem> = emptyList())

@Serializable
data class YoutubeItem(val id: YoutubeId? = null, val snippet: YoutubeSnippet? = null)

@Serializable
data class YoutubeId(val videoId: String? = null)

@Serializable
data class YoutubeSnippet(val title: String? = null, val channelTitle: String? = null, val thumbnails: YoutubeThumbnails? = null)

@Serializable
data class YoutubeThumbnails(val high: YoutubeThumbnailInfo? = null, val default: YoutubeThumbnailInfo? = null)

@Serializable
data class YoutubeThumbnailInfo(val url: String? = null)


@Serializable
data class UsuarioStat(
    val rol: String? = null,
    val instrumento: String? = null
)


class HomeRepository {
    private val httpClient = HttpClient(Android) {
        install(ContentNegotiation) {
            json(Json { ignoreUnknownKeys = true })
        }
    }

    suspend fun getNuevosLanzamientos(): List<Cancion> {
        return withContext(Dispatchers.IO) {
            try {
                // Parity with Web's YouTube API implementation
                val apiKey = "AIzaSyAZdUt8OvDUkVzF5G_Q4oF6E8CkFe6-6K4" // Match web .env.local
                
                val stars = listOf(
                    "\"Ed Sheeran\"", "\"AC/DC\"", "\"Dua Lipa\"", "\"The Weeknd\"", 
                    "\"Bruno Mars\"", "\"Eminem\"", "\"Rihanna\"", "\"Katy Perry\"", 
                    "\"Imagine Dragons\"", "\"Billie Eilish\"", "\"Justin Bieber\"", 
                    "\"Ariana Grande\"", "\"Bad Bunny\"", "\"Shakira\"", "\"Coldplay\"", 
                    "\"Maroon 5\"", "\"Post Malone\"", "\"Drake\"", "\"Taylor Swift\"",
                    "\"Harry Styles\"", "\"Miley Cyrus\"", "\"Lady Gaga\"", "\"Avicii\""
                )
                
                val selectedStars = stars.shuffled().take(4)
                val query = "(${selectedStars.joinToString(" | ")}) \"official video\" -\"mix\" -\"playlist\" -\"enganchado\" -\"recopilacion\" -\"compilacion\" -\"álbum\""
                
                val url = "https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=25&q=${java.net.URLEncoder.encode(query, "UTF-8")}&type=video&videoCategoryId=10&key=$apiKey"
                
                val response = httpClient.get(url)
                val data = response.body<YoutubeSearchResponse>()
                
                val pureSongs = data.items.mapNotNull { item ->
                    val videoId = item.id?.videoId ?: return@mapNotNull null
                    val title = item.snippet?.title ?: return@mapNotNull null
                    val artist = item.snippet.channelTitle
                    val cover = item.snippet.thumbnails?.high?.url ?: item.snippet.thumbnails?.default?.url
                    
                    val titleLower = title.lowercase()
                    if (titleLower.contains("mix") || titleLower.contains("playlist") || titleLower.contains("enganchado") || titleLower.contains("album")) {
                        return@mapNotNull null
                    }
                    
                    Cancion(
                        id = videoId,
                        autorId = "youtube",
                        titulo = title.replace("&quot;", "\"").replace("&#39;", "'"),
                        artista = artist,
                        coverUrl = cover,
                        previewUrl = "https://www.youtube.com/watch?v=$videoId"
                    )
                }
                
                pureSongs.take(10)
            } catch (e: Exception) {
                e.printStackTrace()
                emptyList()
            }
        }
    }

    suspend fun getTopInstrumentos(): List<Instrumento> {
        return withContext(Dispatchers.IO) {
            try {
                // Fetch user data to aggregate visually
                val usuarios = SupabaseClient.client.from("usuarios")
                    .select(columns = Columns.list("rol, instrumento"))
                    .decodeList<UsuarioStat>()
                
                val studentsMap = mutableMapOf<String, Int>()
                val teachersMap = mutableMapOf<String, Int>()

                usuarios.forEach { u ->
                    val rawInst = u.instrumento?.trim()
                    if (rawInst.isNullOrEmpty()) return@forEach
                    
                    val titleInst = rawInst.lowercase().replaceFirstChar { it.uppercase() }

                    if (u.rol == "estudiante") {
                        studentsMap[titleInst] = studentsMap.getOrDefault(titleInst, 0) + 1
                    } else if (u.rol == "profesor") {
                        teachersMap[titleInst] = teachersMap.getOrDefault(titleInst, 0) + 1
                    }
                }

                val allInstrumentNames = (studentsMap.keys + teachersMap.keys).toSet()

                allInstrumentNames.mapIndexed { index, name ->
                    Instrumento(
                        id = index.toString(),
                        nombre = name,
                        imagenUrl = getInstrumentImage(name),
                        totalAlumnos = studentsMap.getOrDefault(name, 0),
                        totalProfesores = teachersMap.getOrDefault(name, 0)
                    )
                }
            } catch (e: Exception) {
                e.printStackTrace()
                emptyList()
            }
        }
    }

    private fun getInstrumentImage(name: String): String {
        val instrumentImages = mapOf(
            "Guitarra" to "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=500&q=80",
            "Piano" to "https://images.unsplash.com/photo-1552422535-c45813c61732?w=500&q=80",
            "Flauta" to "https://images.unsplash.com/photo-1573871666457-fa274191c4d4?w=500&q=80",
            "Violín" to "https://images.unsplash.com/photo-1612225330812-01a9c6b355ec?w=500&q=80",
            "Batería" to "https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=500&q=80",
            "Voz" to "https://images.unsplash.com/photo-1516280440502-65f6c8d1976a?w=500&q=80",
            "Bajo" to "https://images.unsplash.com/photo-1514649923863-ceaf75b770dd?w=500&q=80",
            "Ukelele" to "https://images.unsplash.com/photo-1556012018-50c5c0da73b9?w=500&q=80",
            "Saxofón" to "https://images.unsplash.com/photo-1573887034934-8c01b1a7d6bc?w=500&q=80"
        )
        return instrumentImages[name] ?: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=500&q=80"
    }
}
