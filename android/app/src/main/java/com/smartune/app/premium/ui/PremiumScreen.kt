package com.smartune.app.premium.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.smartune.app.core.theme.*

@Composable
fun PremiumScreen(navController: NavController) {
    LazyColumn(
        modifier = Modifier.fillMaxSize().background(BgMain),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = { navController.popBackStack() }) {
                    Icon(Icons.Default.ArrowBack, contentDescription = null, tint = TextPrimary)
                }
                Text("SmarTune Premium", fontWeight = FontWeight.Bold, fontSize = 22.sp, color = TextPrimary)
            }
        }

        // Hero card
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = BgCard)
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(
                            brush = Brush.verticalGradient(
                                listOf(NeonPink.copy(0.2f), NeonPurple.copy(0.15f), BgCard)
                            )
                        )
                        .padding(32.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(Icons.Default.Star, contentDescription = null, tint = NeonPink, modifier = Modifier.size(48.dp))
                        Spacer(modifier = Modifier.height(16.dp))
                        Text("Desbloquea todo tu potencial", fontWeight = FontWeight.Bold, fontSize = 22.sp, color = TextPrimary, textAlign = TextAlign.Center)
                        Spacer(modifier = Modifier.height(8.dp))
                        Text("Accede a funciones exclusivas para llevar tu música al siguiente nivel", color = TextSecondary, fontSize = 14.sp, textAlign = TextAlign.Center)
                    }
                }
            }
        }

        // Features
        val features = listOf(
            Triple(Icons.Default.School, "Profesores ilimitados", "Conecta con todos los profesores sin restricciones"),
            Triple(Icons.Default.MusicNote, "IA Studio avanzado", "Genera composiciones con inteligencia artificial"),
            Triple(Icons.Default.SportsEsports, "Minijuegos premium", "Accede a todos los juegos de entrenamiento musical"),
            Triple(Icons.Default.Download, "Descargas offline", "Lleva tu contenido contigo a todas partes"),
        )

        features.forEach { (icon, title, desc) ->
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = BgCard)
                ) {
                    Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                        Icon(icon, contentDescription = null, tint = NeonPink, modifier = Modifier.size(24.dp))
                        Spacer(modifier = Modifier.width(12.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(title, fontWeight = FontWeight.Bold, color = TextPrimary, fontSize = 14.sp)
                            Text(desc, color = TextSecondary, fontSize = 12.sp)
                        }
                        Icon(Icons.Default.CheckCircle, contentDescription = null, tint = NeonBlue, modifier = Modifier.size(20.dp))
                    }
                }
            }
        }

        // Subscribe button
        item {
            Button(
                onClick = { /* Subscription flow */ },
                modifier = Modifier.fillMaxWidth().height(56.dp),
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(containerColor = NeonPink)
            ) {
                Text("Suscribirse — $9.99/mes", fontWeight = FontWeight.Bold, fontSize = 16.sp)
            }
        }
    }
}
