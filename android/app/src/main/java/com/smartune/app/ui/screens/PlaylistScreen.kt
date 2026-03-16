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
import com.smartune.app.data.SupabaseModule
import com.smartune.app.ui.theme.SmartuneColors
import io.github.jan.supabase.gotrue.auth
import io.github.jan.supabase.postgrest.postgrest
import kotlinx.coroutines.launch
import kotlinx.serialization.Serializable

@Serializable
private data class FavoritoItem(
    val id: String? = null,
    val titulo: String = "",
    val artista: String = "",
    val cover_url: String = "",
    val genero: String = ""
)

@Composable
fun PlaylistScreen(navController: NavHostController) {
    val scope = rememberCoroutineScope()
    val supabase = SupabaseModule.client
    var likedSongs by remember { mutableStateOf<List<FavoritoItem>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }

    // Load songs from Supabase `favoritos` table
    LaunchedEffect(Unit) {
        scope.launch {
            try {
                val userId = supabase.auth.currentUserOrNull()?.id ?: "anonymous"
                likedSongs = supabase.postgrest["favoritos"]
                    .select() {
                        filter { eq("usuario_id", userId) }
                    }
                    .decodeList<FavoritoItem>()
            } catch (e: Exception) {
                // Fallback: show empty
            } finally {
                isLoading = false
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
            IconButton(onClick = { navController.popBackStack() }) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
            }
            Column {
                Text("Mi Playlist", color = Color.White, fontSize = 28.sp, fontWeight = FontWeight.ExtraBold)
                Text("${likedSongs.size} canciones de Supabase", color = SmartuneColors.Primary, fontSize = 13.sp)
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        if (isLoading) {
            Box(modifier = Modifier.weight(1f).fillMaxWidth(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = SmartuneColors.Primary)
            }
        } else if (likedSongs.isEmpty()) {
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
                                model = song.cover_url,
                                contentDescription = song.titulo,
                                contentScale = ContentScale.Crop,
                                modifier = Modifier
                                    .size(48.dp)
                                    .clip(RoundedCornerShape(8.dp))
                            )
                            Spacer(modifier = Modifier.width(12.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text(song.titulo, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                Text(song.artista, color = Color.Gray, fontSize = 12.sp)
                            }
                            Text(song.genero, color = SmartuneColors.Primary, fontSize = 10.sp, fontWeight = FontWeight.Bold)
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
