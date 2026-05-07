package com.smartune.app.musicswipe.ui

import android.content.Intent
import android.net.Uri
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectDragGestures
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
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
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
    val context = LocalContext.current

    // Snackbar for feedback
    val snackbarHostState = remember { SnackbarHostState() }
    
    // Show like feedback
    LaunchedEffect(viewModel.likeCount) {
        if (viewModel.likeCount > 0) {
            snackbarHostState.showSnackbar(
                message = "❤️ Guardado en Favoritos",
                duration = SnackbarDuration.Short
            )
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        containerColor = BgMain
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(Brush.verticalGradient(listOf(BgMain, Color(0xFF0D0D1A))))
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(top = 16.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // ── Header ──
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 24.dp, vertical = 8.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                "Music",
                                fontSize = 28.sp,
                                fontWeight = FontWeight.Black,
                                color = Color.White
                            )
                            Text(
                                "Swipe",
                                fontSize = 28.sp,
                                fontWeight = FontWeight.Black,
                                color = NeonPink
                            )
                        }
                        Text("Tinder de Música • SmarTune", fontSize = 12.sp, color = TextSecondary)
                    }

                    OutlinedButton(
                        onClick = { navController.navigate("favoritos") },
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = NeonPink),
                        border = androidx.compose.foundation.BorderStroke(1.dp, NeonPink),
                        shape = RoundedCornerShape(24.dp)
                    ) {
                        Icon(Icons.Default.FavoriteBorder, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Favoritos", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                // ── States ──
                when {
                    viewModel.isLoading && viewModel.songs.isEmpty() -> {
                        Box(modifier = Modifier.weight(1f), contentAlignment = Alignment.Center) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                CircularProgressIndicator(color = NeonPink, strokeWidth = 4.dp)
                                Spacer(modifier = Modifier.height(16.dp))
                                Text("Cargando canciones...", color = TextSecondary, fontSize = 14.sp)
                            }
                        }
                    }

                    viewModel.songs.isEmpty() -> {
                        Box(modifier = Modifier.weight(1f), contentAlignment = Alignment.Center) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.padding(24.dp)) {
                                Icon(Icons.Default.MusicOff, contentDescription = null, tint = TextTertiary, modifier = Modifier.size(72.dp))
                                Spacer(modifier = Modifier.height(16.dp))
                                Text("¡Descubrimientos agotados!", color = TextSecondary, fontSize = 18.sp, fontWeight = FontWeight.Medium)
                                Spacer(modifier = Modifier.height(8.dp))
                                Text("Has visto todas las canciones disponibles", color = TextTertiary, fontSize = 14.sp)
                                Spacer(modifier = Modifier.height(24.dp))
                                Button(
                                    onClick = { viewModel.fetchSongs() },
                                    colors = ButtonDefaults.buttonColors(containerColor = NeonPink),
                                    shape = RoundedCornerShape(16.dp),
                                    modifier = Modifier.fillMaxWidth(0.6f).height(48.dp)
                                ) {
                                    Icon(Icons.Default.Refresh, contentDescription = null)
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text("Volver a cargar", fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }

                    else -> {
                        // ── Card Stack ──
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .fillMaxWidth()
                                .padding(horizontal = 20.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            // Draw cards in reverse so top card is rendered last (on top)
                            val visibleSongs = viewModel.songs.take(3).reversed()
                            visibleSongs.forEachIndexed { index, song ->
                                val isTop = song == viewModel.songs.first()
                                val stackIndex = visibleSongs.size - 1 - index // 0=top, 1=mid, 2=back
                                SwipeableCard(
                                    song = song,
                                    isTopCard = isTop,
                                    stackIndex = stackIndex,
                                    onSwiped = { isLike -> viewModel.swipeCurrent(isLike) },
                                    onOpenYouTube = {
                                        val youtubeUrl = "https://www.youtube.com/watch?v=${song.id}"
                                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse("vnd.youtube:${song.id}")).apply {
                                            flags = Intent.FLAG_ACTIVITY_NEW_TASK
                                        }
                                        // Try YouTube app first, fallback to browser
                                        try {
                                            context.startActivity(intent)
                                        } catch (e: Exception) {
                                            context.startActivity(
                                                Intent(Intent.ACTION_VIEW, Uri.parse(youtubeUrl)).apply {
                                                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                                                }
                                            )
                                        }
                                    }
                                )
                            }
                        }

                        // ── Stats Row ──
                        if (viewModel.likeCount > 0 || viewModel.songs.isNotEmpty()) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(horizontal = 24.dp),
                                horizontalArrangement = Arrangement.Center
                            ) {
                                Text(
                                    "❤️ ${viewModel.likeCount} guardadas en favoritos",
                                    color = NeonPink,
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Medium
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        // ── Action Buttons ──
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 40.dp, vertical = 16.dp),
                            horizontalArrangement = Arrangement.SpaceEvenly,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            // Discard Button
                            ActionButton(
                                onClick = { viewModel.swipeCurrent(false) },
                                size = 68.dp,
                                brush = null,
                                backgroundColor = BgCard,
                                borderColor = TextTertiary.copy(alpha = 0.4f)
                            ) {
                                Icon(Icons.Default.Close, contentDescription = "Descartar",
                                    tint = TextSecondary, modifier = Modifier.size(34.dp))
                            }

                            // Like Button (main)
                            ActionButton(
                                onClick = { viewModel.swipeCurrent(true) },
                                size = 84.dp,
                                brush = Brush.linearGradient(listOf(NeonPink, NeonPurple)),
                                backgroundColor = NeonPink,
                                borderColor = Color.Transparent,
                                shadowColor = NeonPink
                            ) {
                                Icon(Icons.Default.Favorite, contentDescription = "Me gusta",
                                    tint = Color.White, modifier = Modifier.size(42.dp))
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))
                    }
                }
            }
        }
    }
}

@Composable
private fun ActionButton(
    onClick: () -> Unit,
    size: androidx.compose.ui.unit.Dp,
    brush: Brush?,
    backgroundColor: Color,
    borderColor: Color,
    shadowColor: Color? = null,
    content: @Composable () -> Unit
) {
    val shadowMod = if (shadowColor != null) {
        Modifier.shadow(16.dp, CircleShape, spotColor = shadowColor)
    } else {
        Modifier.shadow(6.dp, CircleShape)
    }
    Box(
        modifier = shadowMod
            .size(size)
            .clip(CircleShape)
            .then(if (brush != null) Modifier.background(brush) else Modifier.background(backgroundColor))
            .border(1.dp, borderColor, CircleShape)
            .clickable { onClick() },
        contentAlignment = Alignment.Center
    ) {
        content()
    }
}

@Composable
fun SwipeableCard(
    song: MusicSwipeSong,
    isTopCard: Boolean,
    stackIndex: Int,
    onSwiped: (Boolean) -> Unit,
    onOpenYouTube: () -> Unit
) {
    var offsetX by remember(song.id) { mutableStateOf(0f) }
    var offsetY by remember(song.id) { mutableStateOf(0f) }

    val rotation = if (isTopCard) offsetX / 25f else 0f
    val scale = when (stackIndex) {
        0 -> 1f
        1 -> 0.94f
        else -> 0.88f
    }
    val yOffset = when (stackIndex) {
        0 -> 0.dp
        1 -> 16.dp
        else -> 28.dp
    }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .aspectRatio(0.72f)
            .offset(y = yOffset)
            .graphicsLayer(
                translationX = if (isTopCard) offsetX else 0f,
                translationY = if (isTopCard) offsetY else 0f,
                rotationZ = rotation,
                scaleX = scale,
                scaleY = scale
            )
            .pointerInput(isTopCard, song.id) {
                if (!isTopCard) return@pointerInput
                detectDragGestures(
                    onDragEnd = {
                        val threshold = size.width / 3f
                        when {
                            offsetX > threshold -> onSwiped(true)
                            offsetX < -threshold -> onSwiped(false)
                            else -> {
                                offsetX = 0f
                                offsetY = 0f
                            }
                        }
                    }
                ) { change, drag ->
                    change.consume()
                    offsetX += drag.x
                    offsetY += drag.y
                }
            },
        shape = RoundedCornerShape(28.dp),
        elevation = CardDefaults.cardElevation(
            defaultElevation = when (stackIndex) { 0 -> 16.dp; 1 -> 6.dp; else -> 0.dp }
        ),
        colors = CardDefaults.cardColors(containerColor = BgCard)
    ) {
        Box(modifier = Modifier.fillMaxSize()) {
            // Cover image
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
                            colorStops = arrayOf(
                                0.0f to Color.Transparent,
                                0.5f to Color.Black.copy(alpha = 0.2f),
                                1.0f to Color.Black.copy(alpha = 0.92f)
                            )
                        )
                    )
            )

            // Swipe indicators
            if (isTopCard && abs(offsetX) > 60f) {
                val isLike = offsetX > 0
                val alpha = (abs(offsetX) / 200f).coerceIn(0f, 1f)
                Box(
                    modifier = Modifier
                        .align(if (isLike) Alignment.TopStart else Alignment.TopEnd)
                        .padding(32.dp)
                        .graphicsLayer(alpha = alpha, rotationZ = if (isLike) -15f else 15f)
                        .background(
                            if (isLike) NeonPink.copy(alpha = 0.15f) else NeonCyan.copy(alpha = 0.15f),
                            RoundedCornerShape(12.dp)
                        )
                        .border(3.dp, if (isLike) NeonPink else NeonCyan, RoundedCornerShape(12.dp))
                        .padding(horizontal = 20.dp, vertical = 10.dp)
                ) {
                    Text(
                        text = if (isLike) "❤️ LIKE" else "✕ NOPE",
                        color = if (isLike) NeonPink else NeonCyan,
                        fontSize = 32.sp,
                        fontWeight = FontWeight.Black
                    )
                }
            }

            // Song info + YouTube button
            Column(
                modifier = Modifier
                    .align(Alignment.BottomStart)
                    .fillMaxWidth()
                    .padding(24.dp)
            ) {
                Text(
                    text = song.title,
                    color = Color.White,
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Black,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                    lineHeight = 26.sp,
                    style = TextStyle(shadow = androidx.compose.ui.graphics.Shadow(Color.Black, blurRadius = 12f))
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = song.artist,
                    color = NeonPink,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.SemiBold,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Spacer(modifier = Modifier.height(16.dp))

                // YouTube play button (only on top card)
                if (isTopCard) {
                    Row(
                        modifier = Modifier
                            .background(Color.White.copy(alpha = 0.12f), RoundedCornerShape(40.dp))
                            .border(1.dp, Color.White.copy(alpha = 0.2f), RoundedCornerShape(40.dp))
                            .clip(RoundedCornerShape(40.dp))
                            .clickable { onOpenYouTube() }
                            .padding(horizontal = 16.dp, vertical = 10.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            Icons.Default.PlayCircle,
                            contentDescription = "Escuchar en YouTube",
                            tint = Color.White,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            "Escuchar en YouTube",
                            color = Color.White,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }
    }
}
