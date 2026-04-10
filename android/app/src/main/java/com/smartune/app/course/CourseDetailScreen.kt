package com.smartune.app.course

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.rememberAsyncImagePainter
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.viewinterop.AndroidView
import androidx.media3.common.MediaItem
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.PlayerView
import kotlinx.coroutines.launch
import com.smartune.app.explorar.data.repository.SocialRepository
import com.smartune.app.core.theme.*

@Composable
fun CourseDetailScreen(
    onNavigateBack: () -> Unit,
    onNavigateToPlayer: (String) -> Unit = {}
) {
    var isPlaying by androidx.compose.runtime.remember { androidx.compose.runtime.mutableStateOf(false) }
    
    val context = LocalContext.current
    val scope = androidx.compose.runtime.rememberCoroutineScope()
    val repo = androidx.compose.runtime.remember { SocialRepository() }
    
    val exoPlayer = androidx.compose.runtime.remember {
        ExoPlayer.Builder(context).build().apply {
            val mediaItem = MediaItem.fromUri("https://storage.googleapis.com/exoplayer-test-media-0/BigBuckBunny_320x180.mp4")
            setMediaItem(mediaItem)
            prepare()
            addListener(object : Player.Listener {
                override fun onPlaybackStateChanged(state: Int) {
                    if (state == Player.STATE_ENDED) {
                        scope.launch { repo.markLessonCompleted("course_module_1") }
                    }
                }
            })
        }
    }
    
    androidx.compose.runtime.DisposableEffect(Unit) {
        onDispose { exoPlayer.release() }
    }

    LazyColumn(
        modifier = Modifier.fillMaxSize().background(BgMain),
        contentPadding = PaddingValues(bottom = 32.dp)
    ) {
        // Hero Image
        item {
            Box(modifier = Modifier.fillMaxWidth().height(300.dp)) {
                if (!isPlaying) {
                    Image(
                        painter = rememberAsyncImagePainter("https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=800&h=600&crop=edges"),
                        contentDescription = "Course Cover",
                        contentScale = ContentScale.Crop,
                        modifier = Modifier.fillMaxSize().clip(RoundedCornerShape(bottomStart = 32.dp, bottomEnd = 32.dp))
                    )
                } else {
                    AndroidView(
                        factory = { ctx ->
                            PlayerView(ctx).apply {
                                player = exoPlayer
                            }
                        },
                        modifier = Modifier.fillMaxSize().clip(RoundedCornerShape(bottomStart = 32.dp, bottomEnd = 32.dp))
                    )
                }
                // Backdrop Gradient
                Box(
                    modifier = Modifier.fillMaxSize().background(
                        androidx.compose.ui.graphics.Brush.verticalGradient(
                            colors = listOf(BgMain.copy(alpha = 0.8f), androidx.compose.ui.graphics.Color.Transparent, BgMain.copy(alpha = 0.9f))
                        )
                    )
                )
                
                IconButton(
                    onClick = onNavigateBack,
                    modifier = Modifier.padding(16.dp).clip(CircleShape).background(BgMain.copy(alpha = 0.5f))
                ) {
                    Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = TextPrimary)
                }

                Column(
                    modifier = Modifier.align(Alignment.BottomStart).padding(24.dp)
                ) {
                    Text(
                        "Neo-Soul Guitar",
                        fontSize = 32.sp,
                        fontWeight = FontWeight.Black,
                        color = TextPrimary
                    )
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Star, contentDescription = null, tint = NeonCyan, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("4.9 (1.2k Alumnos)", color = TextSecondary, fontSize = 14.sp)
                    }
                }
            }
        }

        item {
            Column(modifier = Modifier.padding(24.dp)) {
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Column {
                        Text("Instructor", color = TextTertiary, fontSize = 12.sp)
                        Text("Alex Neon", color = TextPrimary, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                    }
                    Button(
                        onClick = { 
                            isPlaying = true
                            exoPlayer.play() 
                        },
                        shape = RoundedCornerShape(20.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = NeonPink)
                    ) {
                        Text("INICIAR CURSO", fontWeight = FontWeight.Bold)
                    }
                }

                Spacer(modifier = Modifier.height(32.dp))
                Text("MÓDULOS DEL CURSO", color = TextTertiary, fontWeight = FontWeight.Bold, letterSpacing = 2.sp, fontSize = 12.sp)
                Spacer(modifier = Modifier.height(16.dp))

                // Module List
                for (i in 1..4) {
                    Card(
                        colors = CardDefaults.cardColors(containerColor = BgCard),
                        shape = RoundedCornerShape(16.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 12.dp)
                            .border(1.dp, NeonPink.copy(0.15f), RoundedCornerShape(16.dp))
                            .clickable { onNavigateToPlayer("module_$i") }
                    ) {
                        Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier.size(48.dp).clip(CircleShape).background(BgMain).border(1.dp, NeonCyan, CircleShape),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(Icons.Default.PlayArrow, contentDescription = "Play", tint = NeonCyan)
                            }
                            Spacer(modifier = Modifier.width(16.dp))
                            Column {
                                Text("Módulo $i: Progresiones Jazz", color = TextPrimary, fontWeight = FontWeight.SemiBold)
                                Text("12 mins • Video HD", color = TextTertiary, fontSize = 12.sp)
                            }
                        }
                    }
                }
            }
        }
    }
}
