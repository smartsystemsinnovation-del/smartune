package com.smartune.app.ui.screens

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
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
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.smartune.app.data.SupabaseModule
import com.smartune.app.data.repository.PracticeRepository
import com.smartune.app.ui.components.SectionHeader
import com.smartune.app.ui.components.StoryCircle
import com.smartune.app.ui.theme.SmartuneColors
import io.github.jan.supabase.gotrue.auth
import kotlinx.coroutines.launch
import com.smartune.app.navigation.Screen
import androidx.navigation.NavHostController

@Composable
fun HomeScreen(navController: NavHostController, repository: PracticeRepository) {

    // State for user info
    var userName by remember { mutableStateOf("Músico") }
    val supabase = SupabaseModule.client
    val scope = rememberCoroutineScope()

    LaunchedEffect(Unit) {
        scope.launch {
            try {
                val user = supabase.auth.currentUserOrNull()
                user?.let {
                    userName = it.email?.substringBefore("@")?.replaceFirstChar { c -> c.uppercase() } ?: "Músico"
                }
            } catch (_: Exception) {}
        }
    }

    // Stories data
    val stories = listOf(
        "Tú" to null,
        "Lecciones" to "https://images.unsplash.com/photo-1534126416832-a88fdf2911c2?w=100",
        "Top" to "https://images.unsplash.com/photo-1535930749574-1399327ce78f?w=100",
        "Rock" to "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=100",
        "Tips" to "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=100"
    )

    // Instruments data
    val instruments = listOf(
        "Guitarra" to "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=300",
        "Piano" to "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=300",
        "Batería" to "https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=300",
        "Bajo" to "https://images.unsplash.com/photo-1556449895-a33c9dba33dd?w=300"
    )

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(SmartuneColors.Background),
        contentPadding = PaddingValues(bottom = 100.dp)
    ) {
        // ── Top Bar ──
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text("¡Hola, $userName!", color = Color.Gray, fontSize = 14.sp)
                    Text("SmarTune", color = Color.White, fontSize = 24.sp, fontWeight = FontWeight.ExtraBold)
                }
                Row {
                    IconButton(onClick = {}) {
                        Icon(Icons.Default.Search, null, tint = Color.White)
                    }
                    IconButton(onClick = {}) {
                        Icon(Icons.Default.Notifications, null, tint = Color.White)
                    }
                }
            }
        }

        // ── Stories Bar ──
        item {
            LazyRow(
                contentPadding = PaddingValues(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier.padding(bottom = 16.dp)
            ) {
                items(stories) { (label, url) ->
                    StoryCircle(
                        imageUrl = url,
                        label = label,
                        isAddButton = (url == null)
                    )
                }
            }
        }

        // ── Daily Challenge ──
        item {
            Spacer(modifier = Modifier.height(24.dp))
            Card(
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = SmartuneColors.GlassCard),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
                    .border(1.dp, SmartuneColors.Border, RoundedCornerShape(20.dp))
            ) {
                Row(
                    modifier = Modifier.padding(20.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(50.dp)
                            .clip(CircleShape)
                            .background(SmartuneColors.Primary.copy(alpha = 0.2f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.FlashOn, null, tint = SmartuneColors.Primary, modifier = Modifier.size(28.dp))
                    }
                    Spacer(modifier = Modifier.width(16.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text("RETO DIARIO", color = SmartuneColors.Primary, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        Text("30 min de práctica", color = Color.White, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                        Text("Gana 50 puntos extra", color = Color.Gray, fontSize = 13.sp)
                    }
                    Button(
                        onClick = {},
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = SmartuneColors.Primary),
                        contentPadding = PaddingValues(horizontal = 16.dp)
                    ) {
                        Text("IR", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        // ── Explorar Categorías Section ──
        item {
            Spacer(modifier = Modifier.height(24.dp))
            SectionHeader(
                title = "Categorías",
                modifier = Modifier.padding(horizontal = 16.dp),
                onActionClick = {}
            )
            Spacer(modifier = Modifier.height(12.dp))
        }

        // ── Top Instrumentos Section ──
        item {
            Spacer(modifier = Modifier.height(24.dp))
            SectionHeader(
                title = "Top Instrumentos",
                modifier = Modifier.padding(horizontal = 16.dp),
                onActionClick = {}
            )
            Spacer(modifier = Modifier.height(12.dp))
        }

        item {
            LazyRow(
                contentPadding = PaddingValues(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(instruments) { (name, imageUrl) ->
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier.width(110.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(110.dp)
                                .clip(RoundedCornerShape(16.dp))
                        ) {
                            AsyncImage(
                                model = imageUrl,
                                contentDescription = name,
                                modifier = Modifier.fillMaxSize(),
                                contentScale = ContentScale.Crop
                            )
                        }
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(name, color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Medium)
                    }
                }
            }
        }

        // ── Featured Mini-Game ──
        item {
            Spacer(modifier = Modifier.height(24.dp))
            SectionHeader(
                title = "Mini-Juegos",
                modifier = Modifier.padding(horizontal = 16.dp),
                onActionClick = { navController.navigate(Screen.Arcade.route) }
            )
            Spacer(modifier = Modifier.height(12.dp))
            Card(
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = SmartuneColors.NeonCyan.copy(alpha = 0.1f)),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
                    .border(1.dp, SmartuneColors.NeonCyan.copy(alpha = 0.3f), RoundedCornerShape(20.dp))
                    .clickable { navController.navigate(Screen.SmarTiles.route) }
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(60.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(SmartuneColors.NeonCyan.copy(alpha = 0.2f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.Piano, null, tint = SmartuneColors.NeonCyan, modifier = Modifier.size(32.dp))
                    }
                    Spacer(modifier = Modifier.width(16.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text("SmarTiles", color = Color.White, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                        Text("Entrena tu ritmo", color = SmartuneColors.TextSecondary, fontSize = 13.sp)
                    }
                    Icon(Icons.Default.PlayArrow, null, tint = SmartuneColors.NeonCyan)
                }
            }
        }

        // ── Recent Activity ──
        item {
            Spacer(modifier = Modifier.height(24.dp))
            Text(
                "Actividad Reciente",
                color = Color.White,
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(horizontal = 16.dp)
            )
            Spacer(modifier = Modifier.height(12.dp))
        }

        items(listOf("Lección de Guitarra completada", "Nueva canción en favoritos", "Récord en SmarTiles: 1.2k")) { activity ->
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(8.dp)
                        .clip(CircleShape)
                        .background(SmartuneColors.Primary)
                )
                Spacer(modifier = Modifier.width(12.dp))
                Text(activity, color = SmartuneColors.TextSecondary, fontSize = 14.sp)
            }
        }

        // ── Become a Teacher CTA ──
        item {
            Spacer(modifier = Modifier.height(24.dp))
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
                    .height(240.dp)
                    .clip(RoundedCornerShape(20.dp))
            ) {
                AsyncImage(
                    model = "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600",
                    contentDescription = "Profesor",
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop
                )
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(
                            Brush.verticalGradient(
                                colors = listOf(Color.Transparent, Color.Black.copy(alpha = 0.85f)),
                                startY = 80f
                            )
                        )
                )
                Column(
                    modifier = Modifier
                        .align(Alignment.BottomStart)
                        .padding(20.dp)
                ) {
                    Text("Conviértete en", color = Color.White, fontSize = 16.sp)
                    Text(
                        "PROFESOR",
                        color = SmartuneColors.Primary,
                        fontSize = 36.sp,
                        fontWeight = FontWeight.ExtraBold
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Button(
                        onClick = {},
                        modifier = Modifier.fillMaxWidth().height(44.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent),
                        shape = RoundedCornerShape(14.dp),
                        contentPadding = PaddingValues(0.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .background(SmartuneColors.GradientButton, RoundedCornerShape(14.dp)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("¡YA!", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        }
                    }
                }
            }
        }

        // ── Footer ──
        item {
            Spacer(modifier = Modifier.height(32.dp))
            Text(
                "© 2026 SmarTune — Smart Systems Innovation",
                color = SmartuneColors.TextMuted,
                fontSize = 11.sp,
                modifier = Modifier.padding(horizontal = 16.dp)
            )
            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}
