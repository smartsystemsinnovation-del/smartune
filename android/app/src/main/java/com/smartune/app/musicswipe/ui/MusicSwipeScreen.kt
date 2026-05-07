package com.smartune.app.musicswipe.ui

import android.annotation.SuppressLint
import android.view.ViewGroup
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import coil.compose.AsyncImage
import com.smartune.app.core.theme.*
import com.smartune.app.musicswipe.data.MusicSwipeSong
import com.smartune.app.musicswipe.viewmodel.MusicSwipeViewModel
import kotlin.math.abs

@Composable
fun MusicSwipeScreen(
    navController: NavController,
    viewModel: MusicSwipeViewModel = viewModel()
) {
    var isPlaying by remember { mutableStateOf(true) }

    Box(modifier = Modifier.fillMaxSize()) {
        // 1. Capa de fondo real: Reproductor de YouTube a pantalla completa (pero será tapado)
        if (viewModel.songs.isNotEmpty()) {
            val currentSong = viewModel.songs.first()
            YouTubeAudioPlayer(
                videoId = currentSong.id,
                isPlaying = isPlaying,
                modifier = Modifier.fillMaxSize()
            )
        }

        // 2. Capa de Interfaz Gráfica: Tapa completamente al WebView
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(Brush.verticalGradient(listOf(BgMain, Color(0xFF121212))))
                .padding(top = 16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Header
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 24.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        "MusicSwipe",
                        fontSize = 28.sp,
                        fontWeight = FontWeight.Black,
                        color = Color.White
                    )
                    Text("Tinder de Música • SmarTune", fontSize = 12.sp, color = NeonPink)
                }
                
                Button(
                    onClick = { navController.navigate("favoritos") },
                    colors = ButtonDefaults.buttonColors(containerColor = BgCard),
                    shape = RoundedCornerShape(24.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, NeonPink.copy(alpha = 0.5f))
                ) {
                    Text("Mi Playlist \uD83C\uDFAC", color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            if (viewModel.isLoading && viewModel.songs.isEmpty()) {
                Box(modifier = Modifier.weight(1f), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = NeonPink, strokeWidth = 4.dp)
                }
            } else if (viewModel.error != null && viewModel.songs.isEmpty()) {
                Box(modifier = Modifier.weight(1f), contentAlignment = Alignment.Center) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(viewModel.error ?: "Error", color = NeonRed, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.height(16.dp))
                        Button(onClick = { viewModel.fetchSongs() }, colors = ButtonDefaults.buttonColors(containerColor = NeonRed)) {
                            Text("Reintentar")
                        }
                    }
                }
            } else if (viewModel.songs.isEmpty()) {
                Box(modifier = Modifier.weight(1f), contentAlignment = Alignment.Center) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("¡Descubrimientos agotados!", color = TextSecondary, fontSize = 18.sp, fontWeight = FontWeight.Medium)
                        Spacer(modifier = Modifier.height(16.dp))
                        Button(
                            onClick = { viewModel.fetchSongs() }, 
                            colors = ButtonDefaults.buttonColors(containerColor = NeonPink),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Text("Volver a cargar", fontWeight = FontWeight.Bold)
                        }
                    }
                }
            } else {
                // Cards Stack
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth()
                        .padding(horizontal = 24.dp),
                    contentAlignment = Alignment.Center
                ) {
                    val visibleSongs = viewModel.songs.take(2).reversed()
                    
                    visibleSongs.forEachIndexed { index, song ->
                        val isTopCard = song == viewModel.songs.first()
                        SwipeableCard(
                            song = song,
                            isTopCard = isTopCard,
                            isPlaying = isPlaying,
                            onTogglePlay = { isPlaying = !isPlaying },
                            onSwiped = { isLike -> 
                                isPlaying = true // Reset play state for next song
                                viewModel.swipeCurrent(isLike) 
                            }
                        )
                    }
                }

                // Action Buttons
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 48.dp, vertical = 24.dp),
                    horizontalArrangement = Arrangement.SpaceEvenly,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Discard Button
                    Box(
                        modifier = Modifier
                            .size(72.dp)
                            .shadow(8.dp, CircleShape)
                            .clip(CircleShape)
                            .background(BgCard)
                            .border(2.dp, TextTertiary.copy(alpha = 0.3f), CircleShape)
                            .clickable { 
                                isPlaying = true
                                viewModel.swipeCurrent(false) 
                            },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.Close, contentDescription = "Descartar", tint = TextSecondary, modifier = Modifier.size(36.dp))
                    }

                    // Like Button
                    Box(
                        modifier = Modifier
                            .size(88.dp)
                            .shadow(16.dp, CircleShape, spotColor = NeonPink)
                            .clip(CircleShape)
                            .background(Brush.linearGradient(listOf(NeonPink, NeonPurple)))
                            .clickable { 
                                isPlaying = true
                                viewModel.swipeCurrent(true) 
                            },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.Favorite, contentDescription = "Me gusta", tint = Color.White, modifier = Modifier.size(44.dp))
                    }
                }
                Spacer(modifier = Modifier.height(16.dp))
            }
        }
    }
}

@Composable
fun SwipeableCard(
    song: MusicSwipeSong,
    isTopCard: Boolean,
    isPlaying: Boolean,
    onTogglePlay: () -> Unit,
    onSwiped: (Boolean) -> Unit
) {
    var offsetX by remember { mutableStateOf(0f) }
    var offsetY by remember { mutableStateOf(0f) }
    
    val rotation = offsetX / 25f
    val scale = if (isTopCard) 1f else 0.92f
    
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .aspectRatio(0.75f)
            .graphicsLayer(
                translationX = if (isTopCard) offsetX else 0f,
                translationY = if (isTopCard) offsetY else 0f,
                rotationZ = if (isTopCard) rotation else 0f,
                scaleX = scale,
                scaleY = scale
            )
            .pointerInput(isTopCard) {
                if (!isTopCard) return@pointerInput
                detectDragGestures(
                    onDragEnd = {
                        val threshold = size.width / 3
                        if (offsetX > threshold) {
                            onSwiped(true)
                        } else if (offsetX < -threshold) {
                            onSwiped(false)
                        } else {
                            offsetX = 0f
                            offsetY = 0f
                        }
                    }
                ) { change, dragAmount ->
                    change.consume()
                    offsetX += dragAmount.x
                    offsetY += dragAmount.y
                }
            },
        shape = RoundedCornerShape(32.dp),
        colors = CardDefaults.cardColors(containerColor = BgCard),
        elevation = CardDefaults.cardElevation(defaultElevation = if (isTopCard) 12.dp else 0.dp)
    ) {
        Box(modifier = Modifier.fillMaxSize()) {
            AsyncImage(
                model = song.coverUrl,
                contentDescription = song.title,
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxSize()
            )
            
            // Rich Gradient Overlay
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(
                        Brush.verticalGradient(
                            colors = listOf(
                                Color.Transparent, 
                                Color.Black.copy(alpha = 0.4f),
                                Color.Black.copy(alpha = 0.95f)
                            ),
                            startY = 400f
                        )
                    )
            )

            // Play/Pause Overlay Button (Only for top card)
            if (isTopCard) {
                Box(
                    modifier = Modifier
                        .align(Alignment.Center)
                        .size(64.dp)
                        .clip(CircleShape)
                        .background(Color.Black.copy(alpha = 0.5f))
                        .border(1.dp, Color.White.copy(alpha = 0.3f), CircleShape)
                        .clickable { onTogglePlay() },
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        if (isPlaying) Icons.Default.Pause else Icons.Default.PlayArrow,
                        contentDescription = "Toggle Play",
                        tint = Color.White,
                        modifier = Modifier.size(32.dp)
                    )
                }
            }
            
            // Like/Nope Text Indicators
            if (isTopCard && abs(offsetX) > 50f) {
                val isLike = offsetX > 0
                Text(
                    text = if (isLike) "LIKE" else "NOPE",
                    color = if (isLike) NeonPink else NeonCyan,
                    fontSize = 44.sp,
                    fontWeight = FontWeight.Black,
                    modifier = Modifier
                        .align(Alignment.TopCenter)
                        .padding(top = 40.dp)
                        .graphicsLayer(rotationZ = if (isLike) -15f else 15f)
                        .border(4.dp, if (isLike) NeonPink else NeonCyan, RoundedCornerShape(12.dp))
                        .padding(horizontal = 24.dp, vertical = 8.dp)
                        .background(Color.Black.copy(alpha = 0.4f), RoundedCornerShape(12.dp))
                )
            }

            // Song Info (Glassmorphism look)
            Column(
                modifier = Modifier
                    .align(Alignment.BottomStart)
                    .fillMaxWidth()
                    .padding(24.dp)
            ) {
                Text(
                    text = song.title,
                    color = Color.White,
                    fontSize = 26.sp,
                    fontWeight = FontWeight.Black,
                    maxLines = 2,
                    lineHeight = 30.sp,
                    style = androidx.compose.ui.text.TextStyle(shadow = androidx.compose.ui.graphics.Shadow(color = Color.Black, blurRadius = 8f))
                )
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = song.artist,
                    color = NeonPink,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    style = androidx.compose.ui.text.TextStyle(shadow = androidx.compose.ui.graphics.Shadow(color = Color.Black, blurRadius = 4f))
                )
            }
        }
    }
}

/**
 * Invisible YouTube Player using WebView.
 * Handles automatic playback of the current song.
 */
@SuppressLint("SetJavaScriptEnabled")
@Composable
fun YouTubeAudioPlayer(
    videoId: String,
    isPlaying: Boolean,
    modifier: Modifier = Modifier
) {
    var webViewRef by remember { mutableStateOf<WebView?>(null) }
    
    // Inject JS when play state changes
    LaunchedEffect(isPlaying) {
        if (isPlaying) {
            webViewRef?.evaluateJavascript("if(window.player && player.playVideo) { player.playVideo(); }", null)
        } else {
            webViewRef?.evaluateJavascript("if(window.player && player.pauseVideo) { player.pauseVideo(); }", null)
        }
    }

    // Load new video when ID changes
    LaunchedEffect(videoId) {
        webViewRef?.evaluateJavascript("if(window.player && player.loadVideoById) { player.loadVideoById('$videoId'); }", null)
    }

    AndroidView(
        factory = { context ->
            WebView(context).apply {
                settings.javaScriptEnabled = true
                settings.domStorageEnabled = true
                settings.mediaPlaybackRequiresUserGesture = false // Crucial for autoplay without user touch
                settings.allowContentAccess = true
                webViewClient = WebViewClient()
                webChromeClient = WebChromeClient()
                
                layoutParams = ViewGroup.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT, 
                    ViewGroup.LayoutParams.MATCH_PARENT
                )
                
                val htmlData = """
                    <!DOCTYPE html>
                    <html>
                    <body style="margin:0;padding:0;background-color:black;">
                        <div id="player"></div>
                        <script>
                            var player;
                            function onYouTubeIframeAPIReady() {
                                player = new YT.Player('player', {
                                    height: '100%',
                                    width: '100%',
                                    videoId: '$videoId',
                                    playerVars: {
                                        'autoplay': 1,
                                        'controls': 0,
                                        'rel': 0,
                                        'modestbranding': 1,
                                        'playsinline': 1,
                                        'enablejsapi': 1,
                                        'origin': 'https://www.youtube.com'
                                    },
                                    events: {
                                        'onReady': function(event) {
                                            event.target.playVideo();
                                        },
                                        'onError': function(event) {
                                            console.log("YT Player Error:", event.data);
                                        }
                                    }
                                });
                            }
                        </script>
                        <script src="https://www.youtube.com/iframe_api"></script>
                    </body>
                    </html>
                """.trimIndent()
                
                loadDataWithBaseURL("https://www.youtube.com", htmlData, "text/html", "UTF-8", null)
                webViewRef = this
            }
        },
        modifier = modifier // Receives fillMaxSize from parent
    )
}
