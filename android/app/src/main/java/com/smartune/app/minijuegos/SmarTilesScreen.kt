package com.smartune.app.minijuegos

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.onGloballyPositioned
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import kotlinx.coroutines.delay
import kotlin.random.Random

// ── Paleta Neon Nocturne ──────────────────────────────────────────────────
private val BgMain   = Color(0xFF0A0A0A)
private val NeonPink = Color(0xFFF6339A)
private val NeonCyan = Color(0xFF00FFFF)
private val NeonPurp = Color(0xFF9810FA)

private val LaneColors = listOf(NeonPink, NeonCyan, NeonPurp, NeonPink)

// ── Constants ─────────────────────────────────────────────────────────────
private const val LANES          = 4
private const val TILE_HEIGHT_DP = 100f
private const val BASE_SPEED     = 9f      // px / frame at speed 1x
private const val SPAWN_MS       = 850L    // ms between spawns (decreases with speed)
private const val HIT_ZONE_VISUAL = 0.78f  // where the hit-guide line is drawn on screen

// ── Tile Data (plain class — no Compose state) ────────────────────────────
private class Tile(val id: Long, val lane: Int, var y: Float = -150f) {
    var hit    = false
    var missed = false
}

private enum class GameState { IDLE, PLAYING, GAME_OVER }

@Composable
fun SmarTilesScreen(navController: NavController) {
    val density = LocalDensity.current

    // ── Local Persistence ──
    val context = LocalContext.current
    val prefs = remember { context.getSharedPreferences("smartiles_prefs", android.content.Context.MODE_PRIVATE) }

    // ── Compose-observable state (only what drives UI layout) ──────────
    var gameState    by remember { mutableStateOf(GameState.IDLE) }
    var score        by remember { mutableIntStateOf(0) }
    var highScore    by remember { mutableIntStateOf(prefs.getInt("high_score", 0)) }
    // Single integer that triggers Canvas redraw — updated once per frame
    var frameTick    by remember { mutableIntStateOf(0) }

    // ── Non-observable game data (mutated inside the loop coroutine) ───
    val tiles        = remember { ArrayList<Tile>(32) }
    val speedRef     = remember { mutableFloatStateOf(1f) }
    var boardH       by remember { mutableFloatStateOf(0f) }
    var boardW       by remember { mutableFloatStateOf(0f) }

    // Derived pixel values (recalculated when density changes, stable otherwise)
    val tileHeightPx = remember(density) { with(density) { TILE_HEIGHT_DP.dp.toPx() } }
    val cornerPx     = remember(density) { with(density) { 8.dp.toPx() } }
    val tilePadPx    = remember(density) { with(density) { 4.dp.toPx() } }

    // ── Game Loop ─────────────────────────────────────────────────────
    LaunchedEffect(gameState) {
        if (gameState != GameState.PLAYING) return@LaunchedEffect

        var lastSpawn   = System.currentTimeMillis()
        val gameStart   = System.currentTimeMillis()

        while (gameState == GameState.PLAYING) {
            val now          = System.currentTimeMillis()
            val elapsedSec   = (now - gameStart) / 1000f   // seconds since game start

            // Speed = base + time component + score component
            // Every 10 seconds → +12% speed; every 50 pts → +8% speed
            val timeBoost    = (elapsedSec / 10f) * 0.12f
            val scoreBoost   = (score / 50f)     * 0.08f
            speedRef.floatValue = 1f + timeBoost + scoreBoost

            val speed        = speedRef.floatValue
            val spawnInterval = (SPAWN_MS / speed).toLong().coerceAtLeast(240L)

            // 1. Spawn
            if (boardH > 0f && now - lastSpawn >= spawnInterval) {
                tiles.add(Tile(id = now, lane = Random.nextInt(LANES)))
                lastSpawn = now
            }

            // 2. Move & detect miss
            // A tile is MISSED only when its CENTER passes the bottom edge —
            // gives the player time to tap even when the tile is halfway out.
            var gameOver = false
            var i = tiles.size - 1
            while (i >= 0) {
                val t = tiles[i]
                if (t.hit) { tiles.removeAt(i); i--; continue }
                t.y += BASE_SPEED * speed
                val tileCenter = t.y + tileHeightPx * 0.5f
                if (!t.missed && tileCenter > boardH) {
                    t.missed = true
                    gameOver = true
                }
                if (t.y > boardH + tileHeightPx + 80f) { tiles.removeAt(i) }
                i--
            }

            // 3. End check
            if (gameOver) {
                gameState = GameState.GAME_OVER
                if (score > highScore) {
                    highScore = score
                    prefs.edit().putInt("high_score", score).apply()
                }
                break
            }

            // 4. Trigger Canvas redraw
            frameTick++
            delay(14L)   // ~71 fps ceiling
        }
    }

    // ── Hit logic (called from pointerInput — runs on UI thread) ──────
    fun onLaneTap(laneIdx: Int) {
        if (gameState != GameState.PLAYING) return

        // A tile is hittable when its BOTTOM edge has entered the lower 50% of the board.
        // This means the player can tap the moment any half of the tile is visible
        // in the lower region — very forgiving, no more "too early" game-overs.
        val hitThreshold = boardH * 0.50f

        val target = tiles
            .filter { t ->
                t.lane == laneIdx &&
                !t.hit &&
                !t.missed &&
                (t.y + tileHeightPx) >= hitThreshold  // bottom edge past 50% mark
            }
            .maxByOrNull { it.y }  // lowest tile (closest to bottom)

        if (target != null) {
            target.hit = true
            score += 10
        }
        // Mis-tap on empty lane = no punishment (just ignored)
        // Only missing a tile (not tapping it in time) ends the game
    }

    fun startGame() {
        tiles.clear()
        score = 0
        speedRef.floatValue = 1f
        gameState = GameState.PLAYING
    }

    // ── UI ─────────────────────────────────────────────────────────────
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(BgMain)
    ) {
        // ── Top Bar ─────────────────────────────────────────────────
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 12.dp, vertical = 10.dp)
                .align(Alignment.TopCenter),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = { navController.popBackStack() }) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Volver", tint = Color.White)
            }
            Spacer(modifier = Modifier.weight(1f))
            Text(
                "SMAR-TILES",
                fontWeight = FontWeight.Black,
                fontSize = 17.sp,
                color = Color.White,
                letterSpacing = 3.sp
            )
            Spacer(modifier = Modifier.weight(1f))
            Column(horizontalAlignment = Alignment.End, modifier = Modifier.padding(end = 4.dp)) {
                Text(
                    score.toString(),
                    fontWeight = FontWeight.Black,
                    fontSize = 22.sp,
                    color = NeonCyan
                )
                Text("pts", fontSize = 9.sp, color = Color.White.copy(alpha = 0.4f))
            }
        }

        // ── Game Board (Canvas-based for max performance) ─────────────
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .fillMaxHeight(0.88f)
                .align(Alignment.BottomCenter)
                .clip(RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp))
                .border(
                    1.dp,
                    Brush.horizontalGradient(listOf(NeonPink.copy(0.3f), NeonCyan.copy(0.3f))),
                    RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp)
                )
                .background(Color(0xFF0D0D0D))
                .onGloballyPositioned {
                    boardH = it.size.height.toFloat()
                    boardW = it.size.width.toFloat()
                }
                // Touch input — each quarter-width maps to a lane
                .pointerInput(gameState) {
                    detectTapGestures { offset ->
                        val lane = (offset.x / (boardW / LANES)).toInt().coerceIn(0, LANES - 1)
                        onLaneTap(lane)
                    }
                }
        ) {
            // ── Single Canvas renders everything — zero extra recomposition ──
            Canvas(
                modifier = Modifier.fillMaxSize()
            ) {
                @Suppress("UNUSED_EXPRESSION")
                frameTick  // capture → Canvas redraws every frame

                val laneW = size.width / LANES

                // 1. Scanlines
                val scanColor = NeonCyan.copy(alpha = 0.025f)
                var sy = 0f
                while (sy < size.height) {
                    drawLine(scanColor, Offset(0f, sy), Offset(size.width, sy), strokeWidth = 1f)
                    sy += 28f
                }

                // 2. Lane dividers
                for (l in 1 until LANES) {
                    drawLine(
                        Color.White.copy(alpha = 0.04f),
                        Offset(l * laneW, 0f),
                        Offset(l * laneW, size.height),
                        strokeWidth = 1f
                    )
                }

                // 3. Hit zone guide line per lane (visual only — actual hit logic is in onLaneTap)
                for (l in 0 until LANES) {
                    val laneCol = LaneColors[l]
                    val zoneTop = size.height * HIT_ZONE_VISUAL
                    drawRect(
                        brush = Brush.verticalGradient(
                            listOf(Color.Transparent, laneCol.copy(alpha = 0.07f)),
                            startY = zoneTop, endY = size.height
                        ),
                        topLeft = Offset(l * laneW, zoneTop),
                        size = Size(laneW, size.height - zoneTop)
                    )
                    // hit zone line
                    drawLine(
                        laneCol.copy(alpha = 0.35f),
                        Offset(l * laneW, zoneTop),
                        Offset((l + 1) * laneW, zoneTop),
                        strokeWidth = 2f
                    )
                }

                // 4. Tiles
                for (tile in tiles) {
                    if (tile.missed) continue
                    val col   = LaneColors[tile.lane]
                    val left  = tile.lane * laneW + tilePadPx
                    val tileW = laneW - tilePadPx * 2f

                    drawRoundRect(
                        brush = Brush.verticalGradient(
                            listOf(col.copy(alpha = 0f), col),
                            startY = tile.y, endY = tile.y + tileHeightPx
                        ),
                        topLeft = Offset(left, tile.y),
                        size = Size(tileW, tileHeightPx),
                        cornerRadius = CornerRadius(cornerPx)
                    )
                    // border glow
                    drawRoundRect(
                        color = col.copy(alpha = 0.45f),
                        topLeft = Offset(left, tile.y),
                        size = Size(tileW, tileHeightPx),
                        cornerRadius = CornerRadius(cornerPx),
                        style = Stroke(width = 1.5f)
                    )
                }
            }

            // ── Overlay: IDLE / GAME OVER ──────────────────────────────
            if (gameState != GameState.PLAYING) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(Color.Black.copy(alpha = 0.78f)),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        if (gameState == GameState.GAME_OVER) {
                            Text(
                                "¡FIN DEL JUEGO!",
                                fontWeight = FontWeight.Black,
                                fontSize = 28.sp,
                                color = NeonPink,
                                letterSpacing = 1.sp
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                "Puntuación: $score",
                                fontSize = 20.sp,
                                color = Color.White
                            )
                            if (highScore > 0) {
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    "Récord: $highScore",
                                    fontSize = 13.sp,
                                    color = Color.White.copy(alpha = 0.45f)
                                )
                            }
                            Spacer(modifier = Modifier.height(32.dp))
                            GradientButton(
                                label = "JUGAR OTRA VEZ",
                                colors = listOf(NeonPink, NeonPurp),
                                textColor = Color.White,
                                onClick = { startGame() }
                            )
                        } else {
                            Text(
                                "SMAR-TILES",
                                fontWeight = FontWeight.Black,
                                fontSize = 36.sp,
                                color = Color.White,
                                letterSpacing = 4.sp
                            )
                            Spacer(modifier = Modifier.height(12.dp))
                            Text(
                                "Toca los tiles antes de que caigan.\n¡Una falla y se acaba!",
                                textAlign = TextAlign.Center,
                                color = Color.White.copy(alpha = 0.5f),
                                fontSize = 13.sp,
                                lineHeight = 21.sp
                            )
                            Spacer(modifier = Modifier.height(32.dp))
                            GradientButton(
                                label = "INICIAR JUEGO",
                                colors = listOf(NeonPink, NeonPurp),
                                textColor = Color.White,
                                onClick = { startGame() }
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun GradientButton(
    label: String,
    colors: List<Color>,
    textColor: Color,
    onClick: () -> Unit
) {
    Button(
        onClick = onClick,
        shape = RoundedCornerShape(50.dp),
        colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent),
        contentPadding = PaddingValues(0.dp),
        modifier = Modifier.height(52.dp).widthIn(min = 200.dp)
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.horizontalGradient(colors),
                    RoundedCornerShape(50.dp)
                ),
            contentAlignment = Alignment.Center
        ) {
            Text(
                label,
                fontWeight = FontWeight.Black,
                fontSize = 14.sp,
                color = textColor,
                letterSpacing = 2.sp
            )
        }
    }
}
