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
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import coil.compose.AsyncImage
import com.smartune.app.navigation.Screen
import com.smartune.app.ui.theme.SmartuneColors
import kotlin.math.roundToInt

data class SongData(
    val title: String,
    val artist: String,
    val coverUrl: String,
    val genre: String
)

@Composable
fun FavoritosScreen(navController: NavHostController) {
    val songs = remember {
        listOf(
            SongData("Midnight Drive", "NeonWave", "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400", "Synthwave"),
            SongData("Crystal Rain", "LunaBeats", "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400", "Lo-Fi"),
            SongData("Thunder Pulse", "VoltAge", "https://images.unsplash.com/photo-1571974599782-87624638275e?w=400", "Phonk"),
            SongData("Sakura Dreams", "AkiMori", "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400", "K-Pop"),
            SongData("Velvet Groove", "JazzCat", "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400", "Jazz"),
        )
    }

    var currentIndex by remember { mutableIntStateOf(0) }
    var offsetX by remember { mutableFloatStateOf(0f) }
    var selectedGenre by remember { mutableStateOf("Todos") }
    val genres = listOf("Todos", "Synthwave", "Lo-Fi", "Phonk", "K-Pop", "Jazz")

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
                Text("Desliza para descubrir", color = SmartuneColors.Primary, fontSize = 13.sp)
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
                    onClick = { selectedGenre = genre },
                    label = { Text(genre, fontSize = 11.sp) },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = SmartuneColors.Primary,
                        containerColor = SmartuneColors.GlassCard
                    ),
                    border = FilterChipDefaults.filterChipBorder(
                        borderColor = SmartuneColors.Border,
                        selectedBorderColor = SmartuneColors.Primary,
                        enabled = true, selected = selectedGenre == genre
                    )
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Swipe Card
        if (currentIndex < songs.size) {
            val song = songs[currentIndex]
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
                                        // Liked
                                        currentIndex++
                                    } else if (offsetX < -200) {
                                        // Disliked
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

                        // Gradient overlay
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

                        // Song info
                        Column(
                            modifier = Modifier
                                .align(Alignment.BottomStart)
                                .padding(24.dp)
                        ) {
                            Text(song.genre, color = SmartuneColors.Primary, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            Text(song.title, color = Color.White, fontSize = 28.sp, fontWeight = FontWeight.ExtraBold)
                            Text(song.artist, color = Color.Gray, fontSize = 16.sp)
                        }

                        // Swipe indicators
                        if (offsetX > 50) {
                            Text(
                                "❤️ LIKE",
                                color = Color.Green,
                                fontSize = 32.sp,
                                fontWeight = FontWeight.ExtraBold,
                                modifier = Modifier.align(Alignment.TopStart).padding(24.dp)
                            )
                        }
                        if (offsetX < -50) {
                            Text(
                                "✖️ SKIP",
                                color = Color.Red,
                                fontSize = 32.sp,
                                fontWeight = FontWeight.ExtraBold,
                                modifier = Modifier.align(Alignment.TopEnd).padding(24.dp)
                            )
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
                    onClick = { currentIndex++; offsetX = 0f },
                    containerColor = SmartuneColors.Primary.copy(alpha = 0.3f),
                    shape = CircleShape,
                    modifier = Modifier.size(64.dp)
                ) {
                    Icon(Icons.Default.Favorite, contentDescription = "Like", tint = SmartuneColors.Primary, modifier = Modifier.size(28.dp))
                }
            }
        } else {
            // No more songs
            Box(modifier = Modifier.weight(1f).fillMaxWidth(), contentAlignment = Alignment.Center) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("🎵", fontSize = 64.sp)
                    Spacer(modifier = Modifier.height(16.dp))
                    Text("¡Has explorado todo!", color = Color.White, fontSize = 22.sp, fontWeight = FontWeight.Bold)
                    Text("Vuelve más tarde para más música", color = Color.Gray, fontSize = 14.sp)
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
