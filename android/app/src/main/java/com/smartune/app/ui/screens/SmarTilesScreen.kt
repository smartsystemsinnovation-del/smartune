package com.smartune.app.ui.screens

import android.graphics.Paint
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.drawIntoCanvas
import androidx.compose.ui.graphics.nativeCanvas
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.smartune.app.ui.theme.SmartuneColors
import kotlinx.coroutines.delay

data class Tile(
    val lane: Int,
    var y: Float,
    val color: Color,
    var hit: Boolean = false,
    var missed: Boolean = false
)

@Composable
fun SmarTilesScreen() {
    var isPlaying by remember { mutableStateOf(false) }
    var score by remember { mutableIntStateOf(0) }
    var combo by remember { mutableIntStateOf(0) }
    var speed by remember { mutableFloatStateOf(4f) }
    var tiles by remember { mutableStateOf(listOf<Tile>()) }
    var gameOver by remember { mutableStateOf(false) }
    var frameCount by remember { mutableIntStateOf(0) }

    val laneColors = listOf(SmartuneColors.Primary, SmartuneColors.Accent, Color(0xFF00D4FF), SmartuneColors.Gold)

    LaunchedEffect(isPlaying) {
        if (!isPlaying) return@LaunchedEffect
        while (isPlaying && !gameOver) {
            delay(16L) // ~60fps
            frameCount++

            // Spawn tiles
            if (frameCount % 30 == 0) {
                val lane = (0..3).random()
                tiles = tiles + Tile(lane, -80f, laneColors[lane])
            }

            // Move tiles
            tiles = tiles.map { it.copy(y = it.y + speed) }.toMutableList()

            // Check misses
            val missedTiles = tiles.filter { it.y > 1200f && !it.hit }
            if (missedTiles.isNotEmpty()) {
                combo = 0
                tiles = tiles.filter { it.y <= 1200f || it.hit }
            }

            // Remove old tiles
            tiles = tiles.filter { it.y <= 1400f }

            // Increase speed
            if (score > 0 && score % 10 == 0) {
                speed = 4f + (score / 10f)
            }
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(SmartuneColors.Background)
    ) {
        if (!isPlaying && !gameOver) {
            // Start Screen
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("SMAR", color = Color.White, fontSize = 48.sp, fontWeight = FontWeight.ExtraBold)
                    Text("TILES", color = SmartuneColors.Primary, fontSize = 48.sp, fontWeight = FontWeight.ExtraBold)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("Toca las teclas al ritmo", color = Color.Gray, fontSize = 14.sp)
                    Spacer(modifier = Modifier.height(32.dp))
                    Button(
                        onClick = { isPlaying = true; score = 0; combo = 0; speed = 4f; tiles = emptyList(); frameCount = 0; gameOver = false },
                        colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent),
                        shape = RoundedCornerShape(16.dp),
                        modifier = Modifier.width(200.dp).height(56.dp),
                        contentPadding = PaddingValues(0.dp)
                    ) {
                        Box(
                            modifier = Modifier.fillMaxSize().background(
                                Brush.horizontalGradient(listOf(SmartuneColors.Primary, SmartuneColors.PrimaryDark)),
                                RoundedCornerShape(16.dp)
                            ),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("▶ JUGAR", fontWeight = FontWeight.ExtraBold, letterSpacing = 3.sp, fontSize = 18.sp)
                        }
                    }
                }
            }
        } else if (gameOver) {
            // Game Over Screen
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("GAME OVER", color = Color.Red, fontSize = 36.sp, fontWeight = FontWeight.ExtraBold)
                    Spacer(modifier = Modifier.height(16.dp))
                    Text("Puntuación", color = Color.Gray, fontSize = 14.sp)
                    Text("$score", color = SmartuneColors.Primary, fontSize = 64.sp, fontWeight = FontWeight.ExtraBold)
                    Spacer(modifier = Modifier.height(24.dp))
                    Button(
                        onClick = { isPlaying = true; score = 0; combo = 0; speed = 4f; tiles = emptyList(); frameCount = 0; gameOver = false },
                        colors = ButtonDefaults.buttonColors(containerColor = SmartuneColors.Primary),
                        shape = RoundedCornerShape(16.dp)
                    ) {
                        Text("Reintentar", fontWeight = FontWeight.Bold)
                    }
                }
            }
        } else {
            // Game Canvas
            Row(
                modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text("Puntos: $score", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                Text("Combo: ${combo}x", color = SmartuneColors.Primary, fontWeight = FontWeight.Bold, fontSize = 16.sp)
            }

            Canvas(modifier = Modifier.weight(1f).fillMaxWidth()) {
                val laneWidth = size.width / 4
                val hitZoneY = size.height - 120f

                // Draw lanes
                for (i in 0..4) {
                    drawLine(Color(0x1AFFFFFF), Offset(laneWidth * i, 0f), Offset(laneWidth * i, size.height), strokeWidth = 1f)
                }

                // Draw hit zone
                drawRect(Color(0x1AFFFFFF), Offset(0f, hitZoneY), Size(size.width, 120f))

                // Draw tiles
                tiles.forEach { tile ->
                    if (!tile.hit) {
                        val x = tile.lane * laneWidth
                        drawRoundRect(
                            brush = Brush.verticalGradient(listOf(tile.color, tile.color.copy(alpha = 0.5f))),
                            topLeft = Offset(x + 4, tile.y),
                            size = Size(laneWidth - 8, 80f),
                            cornerRadius = androidx.compose.ui.geometry.CornerRadius(12f, 12f)
                        )
                    }
                }
            }

            // Touch controls
            Row(modifier = Modifier.fillMaxWidth().height(80.dp)) {
                repeat(4) { lane ->
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .fillMaxHeight()
                            .background(laneColors[lane].copy(alpha = 0.1f))
                            .border(0.5.dp, laneColors[lane].copy(alpha = 0.3f))
                            .clickable {
                                val hitTile = tiles.firstOrNull { !it.hit && it.lane == lane && it.y in 900f..1200f }
                                if (hitTile != null) {
                                    hitTile.hit = true
                                    score++
                                    combo++
                                    tiles = tiles.filter { it != hitTile }
                                } else {
                                    combo = 0
                                }
                            },
                        contentAlignment = Alignment.Center
                    ) {
                        Text(listOf("A", "S", "D", "F")[lane], color = laneColors[lane], fontWeight = FontWeight.Bold, fontSize = 20.sp)
                    }
                }
            }
        }
    }
}
