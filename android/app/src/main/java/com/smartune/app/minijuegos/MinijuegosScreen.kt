package com.smartune.app.minijuegos

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.MusicNote
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.blur
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.smartune.app.core.navigation.Routes

// ── Paleta Neon Nocturne ───────────────────────────────────────────────────
private val BgMain   = Color(0xFF0A0A0A)
private val BgCard   = Color(0xFF0F0F0F)
private val BgCard2  = Color(0xFF151515)
private val NeonPink = Color(0xFFF6339A)
private val NeonCyan = Color(0xFF00FFFF)
private val NeonPurp = Color(0xFF9810FA)
private val TextW    = Color.White
private val TextMid  = Color.White.copy(alpha = 0.5f)
private val TextLow  = Color.White.copy(alpha = 0.3f)
private val Border   = Color.White.copy(alpha = 0.06f)

@Composable
fun MinijuegosScreen(navController: NavController) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(BgMain)
    ) {
        // ── Background ambient glows ──────────────────────────────────
        Box(
            modifier = Modifier
                .offset(x = (-60).dp, y = (-80).dp)
                .size(300.dp)
                .blur(150.dp)
                .background(NeonPink.copy(alpha = 0.07f), CircleShape)
        )
        Box(
            modifier = Modifier
                .align(Alignment.BottomEnd)
                .offset(x = 60.dp, y = 80.dp)
                .size(300.dp)
                .blur(150.dp)
                .background(NeonCyan.copy(alpha = 0.05f), CircleShape)
        )

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(horizontal = 20.dp, vertical = 24.dp),
            verticalArrangement = Arrangement.spacedBy(20.dp)
        ) {
            // ── Header ────────────────────────────────────────────────
            item {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    // Modo Arcade pill
                    Row(
                        modifier = Modifier
                            .clip(RoundedCornerShape(50.dp))
                            .background(Color.White.copy(alpha = 0.05f))
                            .border(1.dp, Border, RoundedCornerShape(50.dp))
                            .padding(horizontal = 12.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        // Pulsing dot
                        val pulse by rememberInfiniteTransition(label = "pulse")
                            .animateFloat(
                                initialValue = 0.6f, targetValue = 1f,
                                animationSpec = infiniteRepeatable(
                                    tween(900, easing = FastOutSlowInEasing),
                                    RepeatMode.Reverse
                                ), label = "dot"
                            )
                        Box(
                            modifier = Modifier
                                .size(7.dp)
                                .scale(pulse)
                                .background(NeonCyan, CircleShape)
                        )
                        Text(
                            "MODO ARCADE",
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Black,
                            letterSpacing = 2.sp,
                            color = TextMid
                        )
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    // Title gradient
                    Row(horizontalArrangement = Arrangement.Center) {
                        Text(
                            "SmarTune ",
                            fontWeight = FontWeight.ExtraBold,
                            fontSize = 34.sp,
                            color = TextW
                        )
                        Text(
                            "Arcade",
                            fontWeight = FontWeight.ExtraBold,
                            fontSize = 34.sp,
                            color = NeonCyan // matches web cyan-to-pink gradient hero word
                        )
                    }

                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        "Aprende, compite y domina la música jugando.\nPon a prueba tus reflejos y tu oído musical.",
                        textAlign = TextAlign.Center,
                        fontSize = 13.sp,
                        lineHeight = 20.sp,
                        color = TextMid
                    )
                }
            }

            // ── Hero Card: Smar-Tiles ──────────────────────────────────
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(24.dp))
                        .background(BgCard)
                        .border(1.dp, Border, RoundedCornerShape(24.dp))
                        .clickable { navController.navigate(Routes.SMAR_TILES) }
                ) {
                    Column(modifier = Modifier.padding(20.dp)) {
                        // Animated visual preview
                        SmarTilesPreview()

                        Spacer(modifier = Modifier.height(20.dp))

                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                "Smar-Tiles",
                                fontWeight = FontWeight.ExtraBold,
                                fontSize = 24.sp,
                                color = TextW
                            )
                            Spacer(modifier = Modifier.width(10.dp))
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(4.dp))
                                    .background(NeonCyan.copy(alpha = 0.1f))
                                    .border(1.dp, NeonCyan.copy(alpha = 0.2f), RoundedCornerShape(4.dp))
                                    .padding(horizontal = 7.dp, vertical = 2.dp)
                            ) {
                                Text(
                                    "NUEVO",
                                    fontSize = 8.sp,
                                    fontWeight = FontWeight.Black,
                                    letterSpacing = 1.5.sp,
                                    color = NeonCyan
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            "Toca las notas al ritmo de tus canciones favoritas. Siente la música y mejora tu precisión en este adictivo desafío estilo Rhythm Game.",
                            fontSize = 13.sp,
                            lineHeight = 20.sp,
                            color = TextMid
                        )

                        Spacer(modifier = Modifier.height(14.dp))
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            GameTag("Ritmo")
                            GameTag("Reflejos")
                        }

                        Spacer(modifier = Modifier.height(20.dp))

                        // JUGAR AHORA button
                        Button(
                            onClick = { navController.navigate(Routes.SMAR_TILES) },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(50.dp),
                            shape = RoundedCornerShape(50.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent),
                            contentPadding = PaddingValues(0.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .fillMaxSize()
                                    .background(
                                        Brush.horizontalGradient(listOf(NeonPink, NeonPurp)),
                                        RoundedCornerShape(50.dp)
                                    ),
                                contentAlignment = Alignment.Center
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                                ) {
                                    Icon(
                                        Icons.Default.PlayArrow,
                                        contentDescription = null,
                                        tint = Color.White,
                                        modifier = Modifier.size(18.dp)
                                    )
                                    Text(
                                        "JUGAR AHORA",
                                        fontWeight = FontWeight.Black,
                                        fontSize = 13.sp,
                                        letterSpacing = 1.sp,
                                        color = Color.White
                                    )
                                }
                            }
                        }
                    }
                }
            }

            // ── Other Games Grid ──────────────────────────────────────
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    // Adivina el Acorde
                    ComingSoonCard(
                        modifier = Modifier.weight(1f),
                        title = "Adivina el Acorde",
                        description = "Entrena tu oído absoluto adivinando acordes complejos en contrarreloj.",
                        statusLabel = "Próximamente",
                        accentColor = NeonPink,
                        icon = { Icon(Icons.Default.MusicNote, null, tint = NeonPink.copy(alpha = 0.5f), modifier = Modifier.size(36.dp)) }
                    )
                    // Batalla de Escalas
                    ComingSoonCard(
                        modifier = Modifier.weight(1f),
                        title = "Batalla de Escalas",
                        description = "Compite contra tus amigos para ver quién digita las escalas más rápido.",
                        statusLabel = "En Desarrollo",
                        accentColor = NeonPurp,
                        icon = { Icon(Icons.Default.Bolt, null, tint = NeonPurp.copy(alpha = 0.5f), modifier = Modifier.size(36.dp)) }
                    )
                }
            }

            // ── Suggest a Game card ───────────────────────────────────
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(20.dp))
                        .background(Color.White.copy(alpha = 0.02f))
                        .border(1.dp, Color.White.copy(alpha = 0.08f), RoundedCornerShape(20.dp))
                        .padding(24.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Box(
                            modifier = Modifier
                                .size(44.dp)
                                .clip(CircleShape)
                                .background(Color.White.copy(alpha = 0.05f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.Add, null, tint = TextMid, modifier = Modifier.size(22.dp))
                        }
                        Spacer(modifier = Modifier.height(10.dp))
                        Text("¿Tienes una idea?", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = TextMid)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text("Sugiere un nuevo minijuego para la comunidad.", fontSize = 11.sp, color = TextLow, textAlign = TextAlign.Center)
                    }
                }
                Spacer(modifier = Modifier.height(32.dp))
            }
        }
    }
}

// ── Animated Smar-Tiles preview visual ─────────────────────────────────────
@Composable
private fun SmarTilesPreview() {
    val infiniteTransition = rememberInfiniteTransition(label = "tiles_preview")

    val tile1Y by infiniteTransition.animateFloat(
        initialValue = -40f, targetValue = 220f,
        animationSpec = infiniteRepeatable(tween(2500, easing = LinearEasing)), label = "t1"
    )
    val tile2Y by infiniteTransition.animateFloat(
        initialValue = -100f, targetValue = 220f,
        animationSpec = infiniteRepeatable(tween(3000, easing = LinearEasing)), label = "t2"
    )
    val tile3Y by infiniteTransition.animateFloat(
        initialValue = 60f, targetValue = 220f,
        animationSpec = infiniteRepeatable(tween(2000, easing = LinearEasing)), label = "t3"
    )

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(180.dp)
            .clip(RoundedCornerShape(16.dp))
            .background(Color.Black)
            .border(1.dp, NeonCyan.copy(alpha = 0.15f), RoundedCornerShape(16.dp))
    ) {
        // Scanlines grid
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        listOf(Color.Transparent, Color.Transparent)
                    )
                )
        )

        // Lane dividers
        Row(modifier = Modifier.fillMaxSize()) {
            repeat(4) {
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxHeight()
                        .border(0.5.dp, Color.White.copy(alpha = 0.04f), androidx.compose.ui.graphics.RectangleShape)
                )
            }
        }

        // Animated falling tiles
        // Pink tile – lane 0 (25% from left)
        Box(
            modifier = Modifier
                .fillMaxWidth(0.22f)
                .height(70.dp)
                .offset(x = 4.dp, y = tile1Y.dp)
                .clip(RoundedCornerShape(6.dp))
                .background(
                    Brush.verticalGradient(listOf(NeonPink.copy(alpha = 0f), NeonPink))
                )
        )
        // Cyan tile – lane 1 (50% from left)
        Box(
            modifier = Modifier
                .fillMaxWidth(0.22f)
                .height(80.dp)
                .offset(x = (4 + (300f * 0.25f)).dp, y = tile2Y.dp)
                .clip(RoundedCornerShape(6.dp))
                .background(
                    Brush.verticalGradient(listOf(NeonCyan.copy(alpha = 0f), NeonCyan))
                )
        )
        // Purple tile – lane 3 (75% from left)
        Box(
            modifier = Modifier
                .fillMaxWidth(0.22f)
                .height(60.dp)
                .offset(x = (4 + (300f * 0.625f)).dp, y = tile3Y.dp)
                .clip(RoundedCornerShape(6.dp))
                .background(
                    Brush.verticalGradient(listOf(NeonPurp.copy(alpha = 0f), NeonPurp))
                )
        )

        // Bottom fade
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .fillMaxHeight(0.35f)
                .align(Alignment.BottomCenter)
                .background(Brush.verticalGradient(listOf(Color.Transparent, Color.Black)))
        )
    }
}

// ── Reusable composables ───────────────────────────────────────────────────
@Composable
private fun GameTag(label: String) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(50.dp))
            .background(Color.White.copy(alpha = 0.05f))
            .border(1.dp, Color.White.copy(alpha = 0.05f), RoundedCornerShape(50.dp))
            .padding(horizontal = 12.dp, vertical = 5.dp)
    ) {
        Text(label, fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = TextMid)
    }
}

@Composable
private fun ComingSoonCard(
    modifier: Modifier,
    title: String,
    description: String,
    statusLabel: String,
    accentColor: Color,
    icon: @Composable () -> Unit
) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(20.dp))
            .background(BgCard)
            .border(1.dp, Border, RoundedCornerShape(20.dp))
            .padding(16.dp)
    ) {
        Column {
            // Icon preview box
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(100.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(Color.Black.copy(alpha = 0.5f))
                    .border(1.dp, accentColor.copy(alpha = 0.1f), RoundedCornerShape(12.dp)),
                contentAlignment = Alignment.Center
            ) {
                icon()
            }
            Spacer(modifier = Modifier.height(12.dp))
            Text(title, fontWeight = FontWeight.Bold, fontSize = 15.sp, color = TextW)
            Spacer(modifier = Modifier.height(4.dp))
            Text(description, fontSize = 11.sp, color = TextLow, lineHeight = 16.sp, maxLines = 3)
            Spacer(modifier = Modifier.height(12.dp))
            // Status badge
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(8.dp))
                    .background(Color.White.copy(alpha = 0.05f))
                    .border(1.dp, Border, RoundedCornerShape(8.dp))
                    .padding(horizontal = 10.dp, vertical = 5.dp)
            ) {
                Text(statusLabel, fontSize = 10.sp, fontWeight = FontWeight.SemiBold, color = TextLow)
            }
        }
    }
}

