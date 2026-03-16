package com.smartune.app.ui.screens

import androidx.compose.animation.core.*
import androidx.compose.foundation.*
import androidx.compose.foundation.gestures.detectHorizontalDragGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import coil.compose.AsyncImage
import com.smartune.app.data.SupabaseModule
import com.smartune.app.navigation.Screen
import com.smartune.app.ui.theme.SmartuneColors
import io.github.jan.supabase.gotrue.auth
import io.github.jan.supabase.postgrest.postgrest
import kotlinx.coroutines.launch
import kotlinx.serialization.Serializable
import kotlin.math.roundToInt

@Serializable
data class SongData(
    val id: String = "",
    val title: String,
    val artist: String,
    val coverUrl: String = "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400",
    val genre: String = "Variado"
)

@Serializable
data class FavoritoRow(
    val id: String? = null,
    val usuario_id: String,
    val cancion_id: String,
    val titulo: String,
    val artista: String,
    val cover_url: String,
    val genero: String
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FavoritosScreen(navController: NavHostController) {
    val scope = rememberCoroutineScope()
    val supabase = SupabaseModule.client

    // Demo songs (these would come from an API in production)
    val allSongs = remember {
        listOf(
            SongData("s1", "Midnight Drive", "NeonWave", "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400", "Synthwave"),
            SongData("s2", "Crystal Rain", "LunaBeats", "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400", "Lo-Fi"),
            SongData("s3", "Thunder Pulse", "VoltAge", "https://images.unsplash.com/photo-1571974599782-87624638275e?w=400", "Phonk"),
            SongData("s4", "Sakura Dreams", "AkiMori", "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400", "K-Pop"),
            SongData("s5", "Velvet Groove", "JazzCat", "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400", "Jazz"),
        )
    }

    var currentIndex by remember { mutableIntStateOf(0) }
    var offsetX by remember { mutableFloatStateOf(0f) }
    var selectedGenre by remember { mutableStateOf("Todos") }
    var savedCount by remember { mutableIntStateOf(0) }
    val genres = listOf("Todos", "Synthwave", "Lo-Fi", "Phonk", "K-Pop", "Jazz")

    val filteredSongs = if (selectedGenre == "Todos") allSongs else allSongs.filter { it.genre == selectedGenre }

    // Save a liked song to Supabase
    fun saveFavorite(song: SongData) {
        scope.launch {
            try {
                val userId = supabase.auth.currentUserOrNull()?.id ?: "anonymous"
                supabase.postgrest["favoritos"].insert(
                    FavoritoRow(
                        usuario_id = userId,
                        cancion_id = song.id,
                        titulo = song.title,
                        artista = song.artist,
                        cover_url = song.coverUrl,
                        genero = song.genre
                    )
                )
                savedCount++
            } catch (e: Exception) {
                // Silently handle (duplicate or offline)
            }
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(SmartuneColors.Background)
            .padding(horizontal = 24.dp)
    ) {
        Spacer(modifier = Modifier.height(16.dp))
        Row(verticalAlignment = Alignment.CenterVertically) {
            Column(modifier = Modifier.weight(1f)) {
                Text("MusicSwipe", color = Color.White, fontSize = 28.sp, fontWeight = FontWeight.ExtraBold)
                Text("Desliza para descubrir · $savedCount guardadas", color = SmartuneColors.Primary, fontSize = 13.sp)
            }
            IconButton(onClick = { navController.navigate(Screen.Playlist.route) }) {
                Icon(Icons.Default.QueueMusic, contentDescription = "Playlist", tint = SmartuneColors.Primary)
            }
        }

        // Genre Filters
        Spacer(modifier = Modifier.height(12.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.horizontalScroll(rememberScrollState())) {
            genres.forEach { genre ->
                FilterChip(
                    selected = selectedGenre == genre,
                    onClick = { selectedGenre = genre; currentIndex = 0 },
                    label = { Text(genre, fontSize = 11.sp) },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = SmartuneColors.Primary,
                        containerColor = SmartuneColors.GlassCard
                    ),
                    border = FilterChipDefaults.filterChipBorder(
                        borderColor = SmartuneColors.Border,
                        selectedBorderColor = SmartuneColors.Primary
                    )
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Swipe Card
        if (currentIndex < filteredSongs.size) {
            val song = filteredSongs[currentIndex]
            Box(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth(),
                contentAlignment = Alignment.Center
            ) {
                Card(
                    shape = RoundedCornerShape(32.dp),
                    colors = CardDefaults.cardColors(containerColor = SmartuneColors.Surface),
                    modifier = Modifier
                        .fillMaxWidth(0.9f)
                        .fillMaxHeight(0.85f)
                        .offset { IntOffset(offsetX.roundToInt(), 0) }
                        .graphicsLayer { rotationZ = offsetX / 50f }
                        .pointerInput(currentIndex) {
                            detectHorizontalDragGestures(
                                onDragEnd = {
                                    if (offsetX > 200) {
                                        saveFavorite(song) // SAVE TO SUPABASE
                                        currentIndex++
                                    } else if (offsetX < -200) {
                                        currentIndex++
                                    }
                                    offsetX = 0f
                                },
                                onHorizontalDrag = { _, dragAmount ->
                                    offsetX += dragAmount
                                }
                            )
                        }
                        .border(1.dp, SmartuneColors.Border, RoundedCornerShape(32.dp))
                ) {
                    Box(modifier = Modifier.fillMaxSize()) {
                        AsyncImage(
                            model = song.coverUrl,
                            contentDescription = song.title,
                            contentScale = ContentScale.Crop,
                            modifier = Modifier.fillMaxSize()
                        )
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .background(
                                    Brush.verticalGradient(
                                        listOf(Color.Transparent, Color.Black.copy(alpha = 0.85f)),
                                        startY = 300f
                                    )
                                )
                        )
                        Column(
                            modifier = Modifier
                                .align(Alignment.BottomStart)
                                .padding(24.dp)
                        ) {
                            Text(song.genre, color = SmartuneColors.Primary, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            Text(song.title, color = Color.White, fontSize = 28.sp, fontWeight = FontWeight.ExtraBold)
                            Text(song.artist, color = Color.Gray, fontSize = 16.sp)
                        }
                        if (offsetX > 50) {
                            Text("❤️ LIKE", color = Color.Green, fontSize = 32.sp, fontWeight = FontWeight.ExtraBold,
                                modifier = Modifier.align(Alignment.TopStart).padding(24.dp))
                        }
                        if (offsetX < -50) {
                            Text("✖️ SKIP", color = Color.Red, fontSize = 32.sp, fontWeight = FontWeight.ExtraBold,
                                modifier = Modifier.align(Alignment.TopEnd).padding(24.dp))
                        }
                    }
                }
            }

            // Action buttons
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 16.dp),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                FloatingActionButton(
                    onClick = { currentIndex++; offsetX = 0f },
                    containerColor = Color.Red.copy(alpha = 0.2f),
                    shape = CircleShape,
                    modifier = Modifier.size(64.dp)
                ) {
                    Icon(Icons.Default.Close, contentDescription = "Skip", tint = Color.Red, modifier = Modifier.size(28.dp))
                }
                FloatingActionButton(
                    onClick = { saveFavorite(song); currentIndex++; offsetX = 0f },
                    containerColor = SmartuneColors.Primary.copy(alpha = 0.3f),
                    shape = CircleShape,
                    modifier = Modifier.size(64.dp)
                ) {
                    Icon(Icons.Default.Favorite, contentDescription = "Like", tint = SmartuneColors.Primary, modifier = Modifier.size(28.dp))
                }
            }
        } else {
            Box(modifier = Modifier.weight(1f).fillMaxWidth(), contentAlignment = Alignment.Center) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("🎵", fontSize = 64.sp)
                    Spacer(modifier = Modifier.height(16.dp))
                    Text("¡Has explorado todo!", color = Color.White, fontSize = 22.sp, fontWeight = FontWeight.Bold)
                    Text("$savedCount canciones guardadas", color = SmartuneColors.Primary, fontSize = 14.sp)
                    Spacer(modifier = Modifier.height(16.dp))
                    Button(
                        onClick = { currentIndex = 0 },
                        colors = ButtonDefaults.buttonColors(containerColor = SmartuneColors.Primary),
                        shape = RoundedCornerShape(16.dp)
                    ) {
                        Text("Empezar de Nuevo", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}
