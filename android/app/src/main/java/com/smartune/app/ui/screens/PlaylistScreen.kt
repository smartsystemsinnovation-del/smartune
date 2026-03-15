package com.smartune.app.ui.screens

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import coil.compose.AsyncImage
import com.smartune.app.ui.theme.SmartuneColors

@Composable
fun PlaylistScreen(navController: NavHostController) {
    val likedSongs = remember {
        listOf(
            SongData("Midnight Drive", "NeonWave", "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=200", "Synthwave"),
            SongData("Crystal Rain", "LunaBeats", "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200", "Lo-Fi"),
            SongData("Sakura Dreams", "AkiMori", "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=200", "K-Pop"),
        )
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(SmartuneColors.Background)
            .padding(horizontal = 24.dp)
    ) {
        Spacer(modifier = Modifier.height(16.dp))
        Row(verticalAlignment = Alignment.CenterVertically) {
            IconButton(onClick = { navController.popBackStack() }) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
            }
            Column {
                Text("Mi Playlist", color = Color.White, fontSize = 28.sp, fontWeight = FontWeight.ExtraBold)
                Text("${likedSongs.size} canciones guardadas", color = SmartuneColors.Primary, fontSize = 13.sp)
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        if (likedSongs.isEmpty()) {
            Box(modifier = Modifier.weight(1f).fillMaxWidth(), contentAlignment = Alignment.Center) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("💔", fontSize = 48.sp)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("No hay canciones aún", color = Color.White, fontWeight = FontWeight.Bold)
                    Text("¡Desliza para descubrir música!", color = Color.Gray, fontSize = 14.sp)
                }
            }
        } else {
            LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                itemsIndexed(likedSongs) { index, song ->
                    Card(
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = SmartuneColors.GlassCard),
                        modifier = Modifier
                            .fillMaxWidth()
                            .border(0.5.dp, SmartuneColors.Border, RoundedCornerShape(16.dp))
                    ) {
                        Row(
                            modifier = Modifier.padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("${index + 1}", color = Color.Gray, fontSize = 14.sp, modifier = Modifier.width(24.dp))
                            AsyncImage(
                                model = song.coverUrl,
                                contentDescription = song.title,
                                contentScale = ContentScale.Crop,
                                modifier = Modifier
                                    .size(48.dp)
                                    .clip(RoundedCornerShape(8.dp))
                            )
                            Spacer(modifier = Modifier.width(12.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text(song.title, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                Text(song.artist, color = Color.Gray, fontSize = 12.sp)
                            }
                            Text(song.genre, color = SmartuneColors.Primary, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                            Spacer(modifier = Modifier.width(8.dp))
                            IconButton(onClick = { }) {
                                Icon(Icons.Default.PlayArrow, contentDescription = "Play", tint = SmartuneColors.Primary)
                            }
                        }
                    }
                }
            }
        }
    }
}
