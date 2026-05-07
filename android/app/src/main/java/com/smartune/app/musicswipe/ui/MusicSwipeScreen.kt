package com.smartune.app.musicswipe.ui

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
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import coil.compose.AsyncImage
import com.smartune.app.core.theme.*
import com.smartune.app.musicswipe.data.MusicSwipeSong
import com.smartune.app.musicswipe.viewmodel.MusicSwipeViewModel
import kotlin.math.abs
import kotlin.math.roundToInt

@Composable
fun MusicSwipeScreen(
    navController: NavController,
    viewModel: MusicSwipeViewModel = viewModel()
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(BgMain)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
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
                    Text("Tinder de Música • SmarTune", fontSize = 12.sp, color = TextSecondary)
                }
                
                Button(
                    onClick = { navController.navigate("favoritos") },
                    colors = ButtonDefaults.buttonColors(containerColor = BgCard),
                    border = androidx.compose.foundation.BorderStroke(1.dp, NeonPink.copy(alpha = 0.3f))
                ) {
                    Text("Mi Playlist \uD83C\uDFAC", color = Color.White, fontSize = 12.sp)
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            if (viewModel.isLoading && viewModel.songs.isEmpty()) {
                Box(modifier = Modifier.weight(1f), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = NeonPink)
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
                        Text("¡Descubrimientos agotados!", color = TextSecondary)
                        Spacer(modifier = Modifier.height(16.dp))
                        Button(onClick = { viewModel.fetchSongs() }, colors = ButtonDefaults.buttonColors(containerColor = NeonPink)) {
                            Text("Volver a cargar")
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
                    // Show up to 2 cards for depth effect
                    val visibleSongs = viewModel.songs.take(2).reversed()
                    
                    visibleSongs.forEachIndexed { index, song ->
                        val isTopCard = song == viewModel.songs.first()
                        SwipeableCard(
                            song = song,
                            isTopCard = isTopCard,
                            onSwiped = { isLike -> viewModel.swipeCurrent(isLike) }
                        )
                    }
                }

                // Action Buttons
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 48.dp, vertical = 32.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Discard Button
                    Box(
                        modifier = Modifier
                            .size(64.dp)
                            .clip(CircleShape)
                            .background(BgCard)
                            .border(1.dp, TextTertiary.copy(alpha = 0.3f), CircleShape)
                            .clickable { viewModel.swipeCurrent(false) },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.Close, contentDescription = "Descartar", tint = TextSecondary, modifier = Modifier.size(32.dp))
                    }

                    // Like Button
                    Box(
                        modifier = Modifier
                            .size(80.dp)
                            .clip(CircleShape)
                            .background(Brush.linearGradient(listOf(NeonPink, NeonPurple)))
                            .clickable { viewModel.swipeCurrent(true) },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.Favorite, contentDescription = "Me gusta", tint = Color.White, modifier = Modifier.size(40.dp))
                    }
                }
            }
        }
    }
}

@Composable
fun SwipeableCard(
    song: MusicSwipeSong,
    isTopCard: Boolean,
    onSwiped: (Boolean) -> Unit
) {
    var offsetX by remember { mutableStateOf(0f) }
    var offsetY by remember { mutableStateOf(0f) }
    
    val rotation = offsetX / 20f
    
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .aspectRatio(0.8f)
            .graphicsLayer(
                translationX = if (isTopCard) offsetX else 0f,
                translationY = if (isTopCard) offsetY else 0f,
                rotationZ = if (isTopCard) rotation else 0f,
                scaleX = if (isTopCard) 1f else 0.95f,
                scaleY = if (isTopCard) 1f else 0.95f
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
        elevation = CardDefaults.cardElevation(defaultElevation = if (isTopCard) 8.dp else 0.dp)
    ) {
        Box(modifier = Modifier.fillMaxSize()) {
            AsyncImage(
                model = song.coverUrl,
                contentDescription = song.title,
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxSize()
            )
            
            // Gradient Overlay
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(
                        Brush.verticalGradient(
                            colors = listOf(Color.Transparent, Color.Black.copy(alpha = 0.8f)),
                            startY = 300f
                        )
                    )
            )
            
            // Like/Nope Text Indicators
            if (isTopCard && abs(offsetX) > 50f) {
                val isLike = offsetX > 0
                Text(
                    text = if (isLike) "LIKE" else "NOPE",
                    color = if (isLike) NeonPink else NeonCyan,
                    fontSize = 40.sp,
                    fontWeight = FontWeight.Black,
                    modifier = Modifier
                        .align(Alignment.TopCenter)
                        .padding(top = 40.dp)
                        .graphicsLayer(rotationZ = if (isLike) -15f else 15f)
                        .border(4.dp, if (isLike) NeonPink else NeonCyan, RoundedCornerShape(8.dp))
                        .padding(horizontal = 16.dp, vertical = 8.dp)
                )
            }

            // Song Info
            Column(
                modifier = Modifier
                    .align(Alignment.BottomStart)
                    .padding(24.dp)
            ) {
                Text(
                    text = song.title,
                    color = Color.White,
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold,
                    maxLines = 2
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = song.artist,
                    color = Color.LightGray,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Medium
                )
            }
        }
    }
}
