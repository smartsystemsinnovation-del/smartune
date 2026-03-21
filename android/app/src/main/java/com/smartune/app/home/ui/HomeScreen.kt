package com.smartune.app.home.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.smartune.app.core.navigation.Routes
import com.smartune.app.core.theme.*

@Composable
fun HomeScreen(navController: NavController) {
    LazyColumn(
        modifier = Modifier.fillMaxSize().background(BgMain),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text("SmarTune", fontSize = 28.sp, fontWeight = FontWeight.Bold, color = NeonPink, modifier = Modifier.padding(bottom = 4.dp))
            Text("Aprende música de forma inteligente", fontSize = 14.sp, color = TextSecondary)
        }

        item { Spacer(modifier = Modifier.height(8.dp)) }

        // Quick actions
        item {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                QuickAction(icon = Icons.Default.Explore, label = "Explorar", color = NeonPink, modifier = Modifier.weight(1f)) {
                    navController.navigate(Routes.EXPLORAR)
                }
                QuickAction(icon = Icons.Default.School, label = "Profesores", color = NeonPurple, modifier = Modifier.weight(1f)) {
                    navController.navigate(Routes.PROFESORES)
                }
                QuickAction(icon = Icons.Default.MusicNote, label = "Favoritos", color = NeonBlue, modifier = Modifier.weight(1f)) {
                    navController.navigate(Routes.FAVORITOS)
                }
            }
        }

        // Mis Clases section
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = BgCard)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.VideoCall, contentDescription = null, tint = NeonBlue, modifier = Modifier.size(20.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Mis Clases", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = TextPrimary)
                    }
                    Spacer(modifier = Modifier.height(12.dp))
                    Text("Tus próximas clases aparecerán aquí", color = TextTertiary, fontSize = 13.sp)
                }
            }
        }

        // Become a teacher
        item {
            Card(
                modifier = Modifier.fillMaxWidth().clickable { navController.navigate(Routes.HAZTE_PROFESOR) },
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = BgCard)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth().padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text("¿Eres profesor?", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = TextPrimary)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text("Comparte tu conocimiento musical", color = TextSecondary, fontSize = 13.sp)
                    }
                    Button(
                        onClick = { navController.navigate(Routes.HAZTE_PROFESOR) },
                        shape = RoundedCornerShape(20.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = NeonPink),
                        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp)
                    ) {
                        Text("Aplicar", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    }
                }
            }
        }

        // Premium Card
        item {
            Card(
                modifier = Modifier.fillMaxWidth().clickable { navController.navigate(Routes.PREMIUM) },
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = BgCard)
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(
                            brush = Brush.horizontalGradient(listOf(NeonPink.copy(0.15f), NeonPurple.copy(0.15f), NeonBlue.copy(0.15f)))
                        )
                        .padding(16.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Star, contentDescription = null, tint = NeonPink, modifier = Modifier.size(24.dp))
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text("SmarTune Premium", fontWeight = FontWeight.Bold, color = TextPrimary, fontSize = 16.sp)
                            Text("Accede a funciones exclusivas", color = TextSecondary, fontSize = 13.sp)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun QuickAction(icon: ImageVector, label: String, color: androidx.compose.ui.graphics.Color, modifier: Modifier, onClick: () -> Unit) {
    Card(
        modifier = modifier.clickable { onClick() },
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = BgCard)
    ) {
        Column(
            modifier = Modifier.padding(16.dp).fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(icon, contentDescription = label, tint = color, modifier = Modifier.size(28.dp))
            Spacer(modifier = Modifier.height(8.dp))
            Text(label, fontWeight = FontWeight.SemiBold, fontSize = 12.sp, color = TextPrimary)
        }
    }
}
