package com.smartune.app.ui.screens

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.smartune.app.data.repository.PracticeRepository
import com.smartune.app.ui.theme.SmartuneColors
import kotlinx.coroutines.launch

@Composable
fun HomeScreen(repository: PracticeRepository) {
    var tasks by remember { mutableStateOf<List<Map<String, Any>>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    val coroutineScope = rememberCoroutineScope()

    LaunchedEffect(Unit) {
        coroutineScope.launch {
            repository.getDailyTasks("fake-user-id").onSuccess {
                tasks = it
                isLoading = false
            }.onFailure { isLoading = false }
        }
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(SmartuneColors.Background)
            .padding(horizontal = 24.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Header
        item {
            Spacer(modifier = Modifier.height(16.dp))
            Text("SmarTune", color = Color.White, fontSize = 34.sp, fontWeight = FontWeight.ExtraBold)
            Text("Tu estudio musical inteligente", color = SmartuneColors.Primary, fontSize = 14.sp)
            Spacer(modifier = Modifier.height(24.dp))
        }

        // Daily Practices
        item {
            Text("Prácticas del Día", color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.Bold)
            Text("Método Ebbinghaus", color = SmartuneColors.Accent, fontSize = 12.sp)
            Spacer(modifier = Modifier.height(8.dp))
        }

        if (isLoading) {
            item {
                Box(modifier = Modifier.fillMaxWidth().height(200.dp), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = SmartuneColors.Primary)
                }
            }
        } else if (tasks.isEmpty()) {
            item {
                Card(
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(containerColor = SmartuneColors.GlassCard),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(32.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text("🎵", fontSize = 48.sp)
                        Spacer(modifier = Modifier.height(12.dp))
                        Text("¡Estás al día!", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 18.sp)
                        Text("No hay prácticas pendientes", color = Color.Gray, fontSize = 14.sp)
                    }
                }
            }
        } else {
            items(tasks) { task ->
                TaskCard(task)
            }
        }

        // CTA Section
        item {
            Spacer(modifier = Modifier.height(16.dp))
            Card(
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = Color.Transparent),
                modifier = Modifier
                    .fillMaxWidth()
                    .background(
                        Brush.linearGradient(listOf(SmartuneColors.Primary, SmartuneColors.PrimaryDark)),
                        RoundedCornerShape(24.dp)
                    )
            ) {
                Column(modifier = Modifier.padding(24.dp)) {
                    Text("Únete a Nuestro Equipo", color = Color.White, fontSize = 22.sp, fontWeight = FontWeight.ExtraBold)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("Sé parte de la revolución musical", color = Color.White.copy(alpha = 0.8f), fontSize = 14.sp)
                    Spacer(modifier = Modifier.height(16.dp))
                    Button(
                        onClick = {},
                        colors = ButtonDefaults.buttonColors(containerColor = Color.White),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text("Contactar", color = SmartuneColors.Primary, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        // Footer
        item {
            Spacer(modifier = Modifier.height(16.dp))
            Text("Nosotros", color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                "SmarTune es una plataforma de tecnología musical que fusiona inteligencia artificial, gamificación y neurociencia para transformar tu aprendizaje.",
                color = Color.Gray,
                fontSize = 13.sp,
                lineHeight = 20.sp
            )
            Spacer(modifier = Modifier.height(32.dp))
            Text("© 2026 SmarTune — Smart Systems Innovation", color = Color.Gray.copy(alpha = 0.5f), fontSize = 11.sp)
            Spacer(modifier = Modifier.height(80.dp))
        }
    }
}

@Composable
private fun TaskCard(task: Map<String, Any>) {
    Card(
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = SmartuneColors.GlassCard),
        modifier = Modifier.fillMaxWidth().border(0.5.dp, SmartuneColors.Border, RoundedCornerShape(20.dp))
    ) {
        Row(modifier = Modifier.padding(20.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier.size(12.dp).clip(CircleShape)
                    .background(Brush.linearGradient(listOf(SmartuneColors.Primary, Color(0xFF0E9EEF))))
            )
            Spacer(modifier = Modifier.width(16.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text("Lección: ${task["cancion_id"].toString().take(8)}", color = Color.White, fontWeight = FontWeight.Bold)
                Text("Siguiente repaso en 4h", color = Color.Gray, fontSize = 12.sp)
            }
            Button(
                onClick = {},
                colors = ButtonDefaults.buttonColors(containerColor = SmartuneColors.Accent),
                shape = RoundedCornerShape(10.dp)
            ) {
                Text("Practicar", fontSize = 12.sp)
            }
        }
    }
}
