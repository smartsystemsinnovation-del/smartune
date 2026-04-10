package com.smartune.app.practica

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun PracticaScreen(songId: String, onNavigateBack: () -> Unit) {
    val bgColor = Color(0xFF130921)
    val neonCyan = Color(0xFF00FFFF)
    val cardBg = Color(0xFF2E1E42).copy(alpha = 0.8f)
    
    var sessionScore by remember { mutableStateOf<Int?>(null) }
    var loading by remember { mutableStateOf(false) }
    var isDone by remember { mutableStateOf(false) }
    val coroutineScope = rememberCoroutineScope()

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(bgColor)
            .padding(24.dp)
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
            Spacer(modifier = Modifier.height(32.dp))
            
            Text(
                text = "Sesión de Práctica #$songId",
                style = MaterialTheme.typography.headlineLarge.copy(color = Color.White, fontWeight = FontWeight.Black)
            )
            
            Spacer(modifier = Modifier.height(48.dp))
            
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(32.dp))
                    .background(cardBg)
                    .border(1.dp, Color.White.copy(alpha = 0.1f), RoundedCornerShape(32.dp))
                    .padding(32.dp),
                contentAlignment = Alignment.Center
            ) {
                if (!isDone) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        // Fake visualizer
                        Row(
                            modifier = Modifier.height(60.dp),
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            verticalAlignment = Alignment.Bottom
                        ) {
                            repeat(5) {
                                Box(modifier = Modifier.width(16.dp).height(40.dp).background(neonCyan, RoundedCornerShape(8.dp)))
                            }
                        }
                        
                        Spacer(modifier = Modifier.height(24.dp))
                        Text("Reproduciendo partitura interactiva...", color = Color.LightGray)
                        
                        Spacer(modifier = Modifier.height(48.dp))
                        
                        Text(
                            text = "Calificación de Desempeño (0 - 5)",
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 18.sp
                        )
                        
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(12.dp),
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            (0..5).forEach { score ->
                                Box(
                                    modifier = Modifier
                                        .size(48.dp)
                                        .clip(CircleShape)
                                        .background(if (sessionScore == score) neonCyan else Color.White.copy(alpha = 0.1f))
                                        .clickable { sessionScore = score },
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = score.toString(),
                                        color = if (sessionScore == score) bgColor else Color.White,
                                        fontWeight = FontWeight.Black,
                                        fontSize = 20.sp
                                    )
                                }
                            }
                        }
                        
                        Spacer(modifier = Modifier.height(48.dp))
                        
                        Button(
                            onClick = {
                                coroutineScope.launch {
                                    loading = true
                                    delay(1500) // fake API delay
                                    loading = false
                                    isDone = true
                                }
                            },
                            enabled = sessionScore != null && !loading,
                            colors = ButtonDefaults.buttonColors(containerColor = neonCyan),
                            modifier = Modifier.fillMaxWidth().height(56.dp)
                        ) {
                            Text(
                                text = if (loading) "Sincronizando SRS..." else "Terminar Sesión",
                                color = bgColor,
                                fontWeight = FontWeight.Black,
                                fontSize = 16.sp
                            )
                        }
                    }
                } else {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Box(
                            modifier = Modifier.size(80.dp).background(Color(0xFF00FF99), CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("✓", color = bgColor, fontSize = 48.sp, fontWeight = FontWeight.Bold)
                        }
                        
                        Spacer(modifier = Modifier.height(24.dp))
                        
                        Text("¡Práctica Sincronizada!", color = Color.White, fontSize = 24.sp, fontWeight = FontWeight.Black)
                        
                        Spacer(modifier = Modifier.height(32.dp))
                        
                        Row(horizontalArrangement = Arrangement.spacedBy(24.dp)) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text("Factor Facilidad", color = Color.LightGray)
                                Text("2.65", color = Color.White, fontSize = 24.sp, fontWeight = FontWeight.Bold)
                            }
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text("Intervalo", color = Color.LightGray)
                                Text("3 días", color = Color.White, fontSize = 24.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                        
                        Spacer(modifier = Modifier.height(32.dp))
                        
                        Text("Próxima práctica: Pronto", color = neonCyan, fontWeight = FontWeight.Medium)
                        
                        Spacer(modifier = Modifier.height(32.dp))
                        
                        OutlinedButton(
                            onClick = onNavigateBack,
                            modifier = Modifier.fillMaxWidth().height(56.dp),
                            border = androidx.compose.foundation.BorderStroke(1.dp, Color.White.copy(alpha = 0.2f))
                        ) {
                            Text("Volver al Dashboard", color = Color.White, fontSize = 16.sp)
                        }
                    }
                }
            }
        }
    }
}
