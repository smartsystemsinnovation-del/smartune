package com.smartune.app.player

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.viewinterop.AndroidView
import androidx.media3.common.MediaItem
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.PlayerView
import coil.compose.rememberAsyncImagePainter
import com.smartune.app.core.theme.*
import com.smartune.app.explorar.data.repository.SocialRepository
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PlayerScreen(onNavigateBack: () -> Unit) {
    var isPlaying by remember { mutableStateOf(false) }
    var progress by remember { mutableStateOf(0f) }
    var currentDuration by remember { mutableStateOf(100L) }
    var isLearningMode by remember { mutableStateOf(false) }
    
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val repo = remember { SocialRepository() }
    
    val exoPlayer = remember {
        ExoPlayer.Builder(context).build().apply {
            val mediaItem = MediaItem.fromUri("https://storage.googleapis.com/exoplayer-test-media-0/BigBuckBunny_320x180.mp4")
            setMediaItem(mediaItem)
            prepare()
            
            addListener(object : Player.Listener {
                override fun onIsPlayingChanged(playing: Boolean) {
                    isPlaying = playing
                }
                override fun onPlaybackStateChanged(state: Int) {
                    if (state == Player.STATE_ENDED) {
                        scope.launch { repo.markLessonCompleted("demo_lesson") }
                    }
                }
            })
        }
    }

    LaunchedEffect(isPlaying) {
        while(isPlaying) {
            currentDuration = exoPlayer.duration.coerceAtLeast(1)
            progress = exoPlayer.currentPosition.toFloat() / currentDuration
            delay(1000)
        }
    }

    DisposableEffect(Unit) {
        onDispose { exoPlayer.release() }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(BgMain)
            .padding(24.dp)
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.fillMaxWidth()
        ) {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = onNavigateBack) {
                    Icon(Icons.Default.KeyboardArrowDown, contentDescription = "Minimize", tint = TextPrimary, modifier = Modifier.size(32.dp))
                }
                Text(
                    text = "REPRODUCIENDO AHORA",
                    color = TextTertiary,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 2.sp
                )
                IconButton(onClick = { /* Menu */ }) {
                    Icon(Icons.Default.MoreVert, contentDescription = "Menu", tint = TextPrimary)
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            // Album Art
            Box(
                modifier = Modifier
                    .size(300.dp)
                    .clip(RoundedCornerShape(32.dp))
                    .background(BgCard)
                    .border(
                        width = 1.dp,
                        color = NeonPink.copy(alpha = 0.3f),
                        shape = RoundedCornerShape(32.dp)
                    ),
                contentAlignment = Alignment.Center
            ) {
                if (isLearningMode) {
                    // Educational View: Tablatura Interactive Sync
                    val currentBeat = (progress * 100).toInt()
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(Icons.Default.LibraryMusic, contentDescription = "Notes", tint = NeonCyan, modifier = Modifier.size(80.dp).padding(bottom = 16.dp))
                        Text("Partitura Interactiva (${currentBeat}%)", color = TextSecondary, fontSize = 14.sp)
                        Spacer(modifier = Modifier.height(16.dp))
                        Box(modifier = Modifier.fillMaxWidth(0.8f).height(10.dp).background(NeonPink.copy(0.2f), CircleShape)) {
                            Box(modifier = Modifier.fillMaxWidth(progress).height(10.dp).background(NeonPink, CircleShape))
                        }
                    }
                } else {
                    // Normal Video View via Media3 PlayerView
                    AndroidView(
                        factory = { ctx ->
                            PlayerView(ctx).apply {
                                player = exoPlayer
                                useController = false // Custom compose controls below
                            }
                        },
                        modifier = Modifier.fillMaxSize().clip(RoundedCornerShape(32.dp))
                    )
                }
            }

            Spacer(modifier = Modifier.height(48.dp))

            // Song Info
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Column {
                    Text("Neon Nights", color = TextPrimary, fontSize = 28.sp, fontWeight = FontWeight.Bold)
                    Text("SmarTune AI Productor", color = TextSecondary, fontSize = 16.sp)
                }
                Icon(Icons.Default.FavoriteBorder, contentDescription = "Like", tint = NeonPink, modifier = Modifier.size(28.dp))
            }

            Spacer(modifier = Modifier.height(32.dp))

            // Progress
            Slider(
                value = progress,
                onValueChange = { 
                    progress = it
                    exoPlayer.seekTo((it * currentDuration).toLong())
                },
                colors = SliderDefaults.colors(
                    thumbColor = NeonCyan,
                    activeTrackColor = NeonCyan,
                    inactiveTrackColor = TextTertiary.copy(alpha = 0.3f)
                ),
                modifier = Modifier.fillMaxWidth()
            )
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text("1:24", color = TextTertiary, fontSize = 12.sp)
                Text("-2:10", color = TextTertiary, fontSize = 12.sp)
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Controls
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly,
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = { /* Shuffle */ }) {
                    Icon(Icons.Default.Shuffle, contentDescription = "Shuffle", tint = TextTertiary)
                }
                IconButton(onClick = { /* Prev */ }) {
                    Icon(Icons.Default.SkipPrevious, contentDescription = "Previous", tint = TextPrimary, modifier = Modifier.size(36.dp))
                }
                
                Box(
                    modifier = Modifier
                        .size(72.dp)
                        .clip(CircleShape)
                        .background(NeonPink)
                        .clickable {
                            if (isPlaying) exoPlayer.pause() else exoPlayer.play()
                            isPlaying = !isPlaying
                        },
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        if (isPlaying) Icons.Default.Pause else Icons.Default.PlayArrow,
                        contentDescription = "Play/Pause",
                        tint = BgMain,
                        modifier = Modifier.size(40.dp)
                    )
                }
                
                IconButton(onClick = { /* Next */ }) {
                    Icon(Icons.Default.SkipNext, contentDescription = "Next", tint = TextPrimary, modifier = Modifier.size(36.dp))
                }
                IconButton(onClick = { isLearningMode = !isLearningMode }) {
                    Icon(Icons.Default.School, contentDescription = "Learning Mode", tint = if (isLearningMode) NeonCyan else TextTertiary)
                }
            }
        }
    }
}
