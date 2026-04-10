package com.smartune.app.novedades

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Info
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import com.smartune.app.core.theme.*
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun NovedadesScreen(isAuthenticated: Boolean = false) {
    
    Box(modifier = Modifier.fillMaxSize().background(BgMain)) {
        Column(
            modifier = Modifier.fillMaxSize().padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.height(32.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("🕒", fontSize = 28.sp)
                Spacer(modifier = Modifier.width(12.dp))
                Text(
                    text = "Centro de Novedades",
                    style = MaterialTheme.typography.headlineLarge.copy(
                        fontWeight = FontWeight.Black,
                        fontSize = 32.sp,
                        color = Color.White
                    )
                )
            }
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Las últimas actualizaciones y nuevos lanzamientos de Smartune.",
                color = Color.LightGray,
                textAlign = TextAlign.Center
            )
            Spacer(modifier = Modifier.height(64.dp))
            
            if (!isAuthenticated) {
                // AuthGatekeeper UI Mimic
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(24.dp))
                        .background(BgCard)
                        .border(1.dp, NeonPink.copy(alpha = 0.3f), RoundedCornerShape(24.dp))
                        .padding(32.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Box(
                            modifier = Modifier
                                .size(80.dp)
                                .border(2.dp, NeonPink, CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.Info, contentDescription = null, tint = NeonPink, modifier = Modifier.size(32.dp))
                        }
                        Spacer(modifier = Modifier.height(24.dp))
                        Text(
                            text = "Crea una cuenta para ver las",
                            color = TextPrimary,
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Medium
                        )
                        Text(
                            text = "Novedades",
                            color = NeonPink,
                            fontSize = 28.sp,
                            fontWeight = FontWeight.Black
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            text = "Inicia sesión o regístrate para mantenerte al tanto de los últimos lanzamientos y actualizaciones de nuestra plataforma musical.",
                            color = Color.LightGray,
                            textAlign = TextAlign.Center,
                            fontSize = 14.sp
                        )
                        
                        Spacer(modifier = Modifier.height(32.dp))
                        Button(
                            onClick = { /* TODO */ },
                            colors = ButtonDefaults.buttonColors(containerColor = NeonPink),
                            modifier = Modifier.fillMaxWidth().height(56.dp)
                        ) {
                            Text("Iniciar Sesión / Registrarse", color = BgMain, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        }
                    }
                }
            } else {
                Box(
                    modifier = Modifier.fillMaxWidth().padding(32.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "Estás al día con todo. ¡Sigue practicando!",
                        color = Color.Gray,
                        textAlign = TextAlign.Center,
                        fontSize = 16.sp
                    )
                }
            }
        }
    }
}
