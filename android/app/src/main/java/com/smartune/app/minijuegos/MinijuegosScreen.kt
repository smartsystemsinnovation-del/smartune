package com.smartune.app.minijuegos

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.blur
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun MinijuegosScreen() {
    val bgColor = Color(0xFF130921)
    val neonPink = Color(0xFFEA88FF)
    val neonCyan = Color(0xFF00FFFF)
    val cardBg = Color(0xFF2E1E42).copy(alpha = 0.8f)

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(bgColor)
    ) {
        // Neon Ambient Glow FX
        Box(
            modifier = Modifier
                .offset(x = (-50).dp, y = (-50).dp)
                .size(200.dp)
                .blur(100.dp)
                .background(neonPink.copy(alpha = 0.2f), shape = RoundedCornerShape(100.dp))
        )
        Box(
            modifier = Modifier
                .align(Alignment.BottomEnd)
                .offset(x = 50.dp, y = 50.dp)
                .size(200.dp)
                .blur(100.dp)
                .background(neonCyan.copy(alpha = 0.2f), shape = RoundedCornerShape(100.dp))
        )

        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            item {
                Spacer(modifier = Modifier.height(32.dp))
                
                Text(
                    text = "SmarTune Arcade",
                    style = MaterialTheme.typography.headlineLarge.copy(
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 36.sp,
                        color = Color.White
                    ),
                    textAlign = TextAlign.Center
                )
                
                Spacer(modifier = Modifier.height(8.dp))
                
                Text(
                    text = "Aprende, compite y domina la música jugando.",
                    style = MaterialTheme.typography.bodyLarge.copy(
                        color = Color.LightGray,
                        fontSize = 16.sp
                    ),
                    textAlign = TextAlign.Center
                )
                
                Spacer(modifier = Modifier.height(48.dp))
            }

            // Smar-Tiles Main Hero Card
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(32.dp))
                        .border(
                            1.dp,
                            Brush.horizontalGradient(listOf(neonCyan, neonPink)),
                            RoundedCornerShape(32.dp)
                        )
                        .background(cardBg)
                        .padding(24.dp)
                ) {
                    Column(
                        horizontalAlignment = Alignment.Start
                    ) {
                        // Graphic Box Placeholder
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(200.dp)
                                .clip(RoundedCornerShape(16.dp))
                                .background(Color.Black.copy(alpha = 0.4f))
                                .border(1.dp, neonCyan.copy(alpha = 0.2f), RoundedCornerShape(16.dp)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(text = "🎸 Smar-Tiles", color = neonPink, fontSize = 24.sp, fontWeight = FontWeight.Bold)
                        }

                        Spacer(modifier = Modifier.height(24.dp))
                        
                        Text(
                            text = "Smar-Tiles",
                            fontSize = 32.sp,
                            fontWeight = FontWeight.Black,
                            color = Color.White
                        )
                        
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Badge(
                                containerColor = neonCyan.copy(alpha = 0.1f),
                                contentColor = neonCyan
                            ) { Text("Ritmo", modifier = Modifier.padding(4.dp)) }
                            Badge(
                                containerColor = neonPink.copy(alpha = 0.1f),
                                contentColor = neonPink
                            ) { Text("Reflejos", modifier = Modifier.padding(4.dp)) }
                        }
                        
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        Text(
                            text = "Toca las notas al ritmo de tus canciones favoritas. Siente la música y mejora tu precisión en este adictivo desafío musical.",
                            color = Color.LightGray,
                            fontSize = 14.sp
                        )
                        
                        Spacer(modifier = Modifier.height(24.dp))
                        
                        Button(
                            onClick = { /* TODO: Navigate to Smar-Tiles game */ },
                            modifier = Modifier.fillMaxWidth().height(56.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent)
                        ) {
                            Box(
                                modifier = Modifier
                                    .fillMaxSize()
                                    .background(
                                        Brush.horizontalGradient(listOf(neonCyan, neonPink)),
                                        RoundedCornerShape(28.dp)
                                    ),
                                contentAlignment = Alignment.Center
                            ) {
                                Text("Jugar Ahora", color = bgColor, fontWeight = FontWeight.Bold, fontSize = 18.sp)
                            }
                        }
                    }
                }
                
                Spacer(modifier = Modifier.height(32.dp))
            }

            // Other games grid
            item {
                Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                    MiniGameCard(
                        title = "Adivina el Acorde",
                        tags = listOf("Oído Musical", "Teoría"),
                        status = "Próximamente"
                    )
                    MiniGameCard(
                        title = "Batalla de Escalas",
                        tags = listOf("Multijugador", "Velocidad"),
                        status = "En Desarrollo"
                    )
                    
                    // Spacer for more modes
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(120.dp)
                            .clip(RoundedCornerShape(24.dp))
                            .border(2.dp, Color.White.copy(alpha = 0.1f), RoundedCornerShape(24.dp))
                            .background(Color.Black.copy(alpha = 0.1f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("MÁS MODOS PRONTO", color = Color.White.copy(alpha = 0.5f), fontWeight = FontWeight.Medium)
                    }
                }
                
                Spacer(modifier = Modifier.height(64.dp))
            }
        }
    }
}

@Composable
fun MiniGameCard(title: String, tags: List<String>, status: String) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(24.dp))
            .background(Color(0xFF2E1E42).copy(alpha = 0.6f))
            .border(1.dp, Color.White.copy(alpha = 0.05f), RoundedCornerShape(24.dp))
            .padding(16.dp)
    ) {
        Column {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(100.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(Color.Black.copy(alpha = 0.4f)),
                contentAlignment = Alignment.Center
            ) {
                // Placeholder for icon
            }
            Spacer(modifier = Modifier.height(16.dp))
            Text(title, fontWeight = FontWeight.Bold, fontSize = 20.sp, color = Color.White)
            Spacer(modifier = Modifier.height(8.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                tags.forEach { tag ->
                    Badge(
                        containerColor = Color.White.copy(alpha = 0.1f),
                        contentColor = Color.White.copy(alpha = 0.8f)
                    ) { Text(tag, modifier = Modifier.padding(4.dp)) }
                }
            }
            Spacer(modifier = Modifier.height(16.dp))
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(8.dp))
                    .background(Color.Black.copy(alpha = 0.3f))
                    .border(1.dp, Color.White.copy(alpha = 0.1f), RoundedCornerShape(8.dp))
                    .padding(horizontal = 12.dp, vertical = 6.dp)
            ) {
                Text(status, color = Color.White.copy(alpha = 0.6f), fontSize = 12.sp)
            }
        }
    }
}
