package com.smartune.app.teacher.ui

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.smartune.app.core.navigation.Routes
import com.smartune.app.core.theme.*
import com.smartune.app.explorar.data.models.ClaseAgendada
import com.smartune.app.explorar.data.repository.SocialRepository
import kotlinx.coroutines.launch

@Composable
fun TeacherDashboardScreen(navController: NavController) {
    val scope = rememberCoroutineScope()
    val repo = remember { SocialRepository() }
    var clases by remember { mutableStateOf<List<ClaseAgendada>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    val context = LocalContext.current

    LaunchedEffect(Unit) {
        clases = repo.getMisClases()
        isLoading = false
    }

    LazyColumn(
        modifier = Modifier.fillMaxSize().background(BgMain),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item {
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = { navController.popBackStack() }) {
                    Icon(Icons.Default.ArrowBack, contentDescription = null, tint = TextPrimary)
                }
                Text("Panel de Profesor", fontWeight = FontWeight.Bold, fontSize = 22.sp, color = TextPrimary)
            }
        }

        // Create class button
        item {
            Button(
                onClick = { navController.navigate(Routes.CREAR_CLASE) },
                modifier = Modifier.fillMaxWidth().height(52.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = NeonBlue)
            ) {
                Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(20.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text("Crear nueva clase", fontWeight = FontWeight.Bold, fontSize = 15.sp)
            }
        }

        item {
            Text("MIS CLASES", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = TextTertiary, letterSpacing = 2.sp, modifier = Modifier.padding(top = 8.dp))
        }

        if (isLoading) {
            item {
                Box(modifier = Modifier.fillMaxWidth().padding(32.dp), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = NeonPink, modifier = Modifier.size(32.dp))
                }
            }
        } else if (clases.isEmpty()) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = BgCard)
                ) {
                    Column(
                        modifier = Modifier.padding(32.dp).fillMaxWidth(),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(Icons.Default.CalendarToday, contentDescription = null, tint = TextTertiary, modifier = Modifier.size(40.dp))
                        Spacer(modifier = Modifier.height(12.dp))
                        Text("No hay clases agendadas", fontWeight = FontWeight.Bold, color = TextSecondary)
                        Text("Crea tu primera clase", color = TextTertiary, fontSize = 13.sp)
                    }
                }
            }
        } else {
            items(clases) { clase ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = BgCard)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.VideoCall, contentDescription = null, tint = NeonBlue, modifier = Modifier.size(20.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(clase.titulo, fontWeight = FontWeight.Bold, color = TextPrimary, fontSize = 15.sp)
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Text("Alumno: ${clase.alumnoNombre}", color = TextSecondary, fontSize = 13.sp)
                        Text("Fecha: ${clase.fechaInicio}", color = TextTertiary, fontSize = 12.sp)

                        clase.meetLink?.let { link ->
                            Spacer(modifier = Modifier.height(12.dp))
                            Button(
                                onClick = {
                                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(link))
                                    context.startActivity(intent)
                                },
                                shape = RoundedCornerShape(20.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = NeonBlue),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Icon(Icons.Default.VideoCall, contentDescription = null, modifier = Modifier.size(18.dp))
                                Spacer(modifier = Modifier.width(8.dp))
                                Text("Unirse a Meet", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                            }
                        }
                    }
                }
            }
        }
    }
}

// ── Create Class Screen ──
@Composable
fun CrearClaseScreen(navController: NavController) {
    val scope = rememberCoroutineScope()
    val repo = remember { SocialRepository() }
    var titulo by remember { mutableStateOf("") }
    var alumnoId by remember { mutableStateOf("") }
    var isCreating by remember { mutableStateOf(false) }

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
                Text("Crear Clase", fontWeight = FontWeight.Bold, fontSize = 22.sp, color = TextPrimary)
            }
        }

        item {
            OutlinedTextField(
                value = titulo,
                onValueChange = { titulo = it },
                label = { Text("Título de la clase") },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = NeonPink, unfocusedBorderColor = TextTertiary, focusedTextColor = TextPrimary, unfocusedTextColor = TextPrimary, cursorColor = NeonPink, focusedContainerColor = BgCard, unfocusedContainerColor = BgCard),
                singleLine = true
            )
        }

        item {
            OutlinedTextField(
                value = alumnoId,
                onValueChange = { alumnoId = it },
                label = { Text("ID del alumno") },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = NeonPink, unfocusedBorderColor = TextTertiary, focusedTextColor = TextPrimary, unfocusedTextColor = TextPrimary, cursorColor = NeonPink, focusedContainerColor = BgCard, unfocusedContainerColor = BgCard),
                singleLine = true
            )
        }

        item {
            Button(
                onClick = {
                    scope.launch {
                        isCreating = true
                        val fechaInicio = java.time.OffsetDateTime.now().plusDays(1).toString()
                        val fechaFin = java.time.OffsetDateTime.now().plusDays(1).plusHours(1).toString()
                        repo.crearClase(titulo, alumnoId, fechaInicio, fechaFin)
                        isCreating = false
                        navController.popBackStack()
                    }
                },
                enabled = titulo.isNotBlank() && alumnoId.isNotBlank() && !isCreating,
                modifier = Modifier.fillMaxWidth().height(52.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = NeonPink)
            ) {
                if (isCreating) CircularProgressIndicator(color = TextPrimary, modifier = Modifier.size(20.dp), strokeWidth = 2.dp)
                else Text("Crear y generar Meet", fontWeight = FontWeight.Bold, fontSize = 15.sp)
            }
        }
    }
}
