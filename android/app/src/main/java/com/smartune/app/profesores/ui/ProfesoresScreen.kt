package com.smartune.app.profesores.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import coil.compose.AsyncImage
import com.smartune.app.core.navigation.Routes
import com.smartune.app.core.theme.*
import com.smartune.app.explorar.data.models.Profesor
import com.smartune.app.explorar.data.repository.SocialRepository

@Composable
fun ProfesoresScreen(navController: NavController) {
    val repo = remember { SocialRepository() }
    var profesores by remember { mutableStateOf<List<Profesor>>(emptyList()) }
    var misProfesores by remember { mutableStateOf<List<Profesor>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }

    LaunchedEffect(Unit) {
        val all = repo.getProfesores()
        val mine = repo.getMisProfesoresAsignados()
        misProfesores = mine
        profesores = all.filter { p -> mine.none { it.id == p.id } }
        isLoading = false
    }

    LazyColumn(
        modifier = Modifier.fillMaxSize().background(BgMain),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item {
            Text("Profesores", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
            Spacer(modifier = Modifier.height(4.dp))
            Text("Encuentra tu profesor ideal", fontSize = 14.sp, color = TextSecondary)
        }

        // Become a teacher CTA
        item {
            Card(
                modifier = Modifier.fillMaxWidth().clickable { navController.navigate(Routes.HAZTE_PROFESOR) },
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = NeonPink.copy(alpha = 0.1f))
            ) {
                Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.School, contentDescription = null, tint = NeonPink, modifier = Modifier.size(24.dp))
                    Spacer(modifier = Modifier.width(12.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text("¿Quieres ser profesor?", fontWeight = FontWeight.Bold, color = TextPrimary, fontSize = 14.sp)
                        Text("Aplica y comparte tu conocimiento", color = TextSecondary, fontSize = 12.sp)
                    }
                    Icon(Icons.Default.ArrowForward, contentDescription = null, tint = NeonPink, modifier = Modifier.size(20.dp))
                }
            }
        }

        if (misProfesores.isNotEmpty()) {
            item {
                Text("Mis Profesores Asignados", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = TextPrimary, modifier = Modifier.padding(top = 8.dp))
            }
            items(misProfesores) { prof ->
                ProfesorCard(prof, isAssigned = true) {
                    navController.navigate(Routes.profesorDetail(prof.id))
                }
            }
            item {
                Text("Descubrir Profesores", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = TextPrimary, modifier = Modifier.padding(top = 16.dp))
            }
        }

        if (isLoading) {
            item {
                Box(modifier = Modifier.fillMaxWidth().padding(48.dp), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = NeonPink, modifier = Modifier.size(32.dp))
                }
            }
        } else if (profesores.isEmpty()) {
            item {
                Column(
                    modifier = Modifier.fillMaxWidth().padding(48.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(Icons.Default.School, contentDescription = null, tint = TextTertiary, modifier = Modifier.size(48.dp))
                    Spacer(modifier = Modifier.height(12.dp))
                    Text("No hay profesores disponibles", fontWeight = FontWeight.Bold, color = TextSecondary)
                    Text("Vuelve pronto", color = TextTertiary, fontSize = 13.sp)
                }
            }
        } else {
            items(profesores) { prof ->
                ProfesorCard(prof) {
                    navController.navigate(Routes.profesorDetail(prof.id))
                }
            }
        }
    }
}

@Composable
private fun ProfesorCard(profesor: Profesor, isAssigned: Boolean = false, onClick: () -> Unit) {
    val avatarUrl = profesor.avatarUrl ?: "https://ui-avatars.com/api/?background=9810fa&color=fff&bold=true&size=128&name=${profesor.nombre}"

    Card(
        modifier = Modifier.fillMaxWidth().clickable { onClick() },
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = BgCard)
    ) {
        Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
            AsyncImage(
                model = avatarUrl,
                contentDescription = null,
                modifier = Modifier.size(56.dp).clip(CircleShape),
                contentScale = ContentScale.Crop
            )
            Spacer(modifier = Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(profesor.nombre, fontWeight = FontWeight.Bold, fontSize = 15.sp, color = TextPrimary)
                    Spacer(modifier = Modifier.width(4.dp))
                    Icon(Icons.Default.Verified, contentDescription = null, tint = NeonBlue, modifier = Modifier.size(14.dp))
                }
                profesor.instrumento?.let {
                    Text(it, fontSize = 13.sp, color = NeonPink)
                }
                Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(top = 4.dp)) {
                    Icon(Icons.Default.Star, contentDescription = null, tint = NeonPink, modifier = Modifier.size(14.dp))
                    Text(" ${profesor.rating ?: 5.0}", fontSize = 12.sp, color = TextSecondary)
                    Spacer(modifier = Modifier.width(12.dp))
                    Text("${profesor.totalClases} clases", fontSize = 12.sp, color = TextTertiary)
                }
            }
            Button(
                onClick = onClick,
                shape = RoundedCornerShape(20.dp),
                colors = ButtonDefaults.buttonColors(containerColor = if (isAssigned) NeonBlue else NeonPink),
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp)
            ) {
                Text(if (isAssigned) "Mis clases" else "Ver", fontWeight = FontWeight.Bold, fontSize = 13.sp)
            }
        }
    }
}

// ── Profesor Detail Screen ──
@Composable
fun ProfesorDetailScreen(profesorId: String, navController: NavController) {
    val repo = remember { SocialRepository() }
    var profesor by remember { mutableStateOf<Profesor?>(null) }
    var clases by remember { mutableStateOf<List<com.smartune.app.explorar.data.models.ClaseAgendada>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }

    LaunchedEffect(profesorId) {
        // Fetch all teachers to find this one (or create a specific method if preferred)
        profesor = repo.getMisProfesoresAsignados().find { it.id == profesorId } 
            ?: repo.getProfesores().find { it.id == profesorId }
        clases = repo.getMisClases(profesorId)
        isLoading = false
    }

    if (isLoading) {
        Box(modifier = Modifier.fillMaxSize().background(BgMain), contentAlignment = Alignment.Center) {
            CircularProgressIndicator(color = NeonPink)
        }
        return
    }

    Column(
        modifier = Modifier.fillMaxSize().background(BgMain).padding(16.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            IconButton(onClick = { navController.popBackStack() }) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = TextPrimary)
            }
            Text(profesor?.nombre ?: "Profesor", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = TextPrimary)
        }
        Spacer(modifier = Modifier.height(24.dp))
        
        profesor?.let {
            Row(verticalAlignment = Alignment.CenterVertically) {
                AsyncImage(
                    model = it.avatarUrl ?: "https://ui-avatars.com/api/?background=9810fa&color=fff&bold=true&size=128&name=${it.nombre}",
                    contentDescription = null,
                    modifier = Modifier.size(80.dp).clip(CircleShape),
                    contentScale = ContentScale.Crop
                )
                Spacer(modifier = Modifier.width(16.dp))
                Column {
                    Text(it.nombre, fontWeight = FontWeight.Bold, fontSize = 20.sp, color = TextPrimary)
                    Text(it.instrumento ?: "Especialidad no especificada", color = NeonPink, fontSize = 14.sp)
                    it.bio?.let { bio ->
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(bio, color = TextSecondary, fontSize = 12.sp, maxLines = 2)
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))
        
        if (clases.isNotEmpty()) {
            Text("Clases Agendadas", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = TextPrimary)
            Spacer(modifier = Modifier.height(12.dp))
            LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                items(clases) { clase ->
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = BgCard)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text(clase.titulo, fontWeight = FontWeight.Bold, color = TextPrimary)
                            Text(clase.fechaInicio, color = TextSecondary, fontSize = 12.sp)
                            Spacer(modifier = Modifier.height(8.dp))
                            if (clase.meetLink != null) {
                                Button(
                                    onClick = { /* Abrir meetLink */ },
                                    colors = ButtonDefaults.buttonColors(containerColor = NeonBlue),
                                    modifier = Modifier.fillMaxWidth().height(36.dp),
                                    shape = RoundedCornerShape(8.dp)
                                ) {
                                    Icon(Icons.Default.VideoCall, contentDescription = null, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text("Unirse a la clase")
                                }
                            } else {
                                Text("Esperando enlace del profesor...", color = TextTertiary, fontSize = 12.sp)
                            }
                        }
                    }
                }
            }
            Spacer(modifier = Modifier.height(16.dp))
        }

        Button(
            onClick = { /* Connect / schedule class */ },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            colors = ButtonDefaults.buttonColors(containerColor = if (clases.isNotEmpty()) BgCard else NeonBlue)
        ) {
            Icon(Icons.Default.CalendarToday, contentDescription = null, modifier = Modifier.size(20.dp), tint = if (clases.isNotEmpty()) TextPrimary else Color.White)
            Spacer(modifier = Modifier.width(8.dp))
            Text(if (clases.isNotEmpty()) "Agendar nueva clase" else "Conectar y agendar clase", fontWeight = FontWeight.Bold, color = if (clases.isNotEmpty()) TextPrimary else Color.White)
        }
    }
}

// ── Hazte Profesor Screen ──
@Composable
fun HaztePrScreen(navController: NavController) {
    var nombre by remember { mutableStateOf("") }
    var instrumento by remember { mutableStateOf("") }
    var bio by remember { mutableStateOf("") }
    var isSubmitting by remember { mutableStateOf(false) }
    var submitted by remember { mutableStateOf(false) }

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
                Text("Hazte Profesor", fontWeight = FontWeight.Bold, fontSize = 22.sp, color = TextPrimary)
            }
        }

        if (submitted) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = NeonBlue.copy(alpha = 0.1f))
                ) {
                    Column(modifier = Modifier.padding(24.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(Icons.Default.CheckCircle, contentDescription = null, tint = NeonBlue, modifier = Modifier.size(48.dp))
                        Spacer(modifier = Modifier.height(12.dp))
                        Text("¡Solicitud enviada!", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = TextPrimary)
                        Text("Tu solicitud está siendo revisada por IA", color = TextSecondary, fontSize = 13.sp, modifier = Modifier.padding(top = 4.dp))
                    }
                }
            }
        } else {
            item {
                OutlinedTextField(
                    value = instrumento,
                    onValueChange = { instrumento = it },
                    label = { Text("Instrumento o especialidad") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = NeonPink, unfocusedBorderColor = TextTertiary, focusedTextColor = TextPrimary, unfocusedTextColor = TextPrimary, cursorColor = NeonPink, focusedContainerColor = BgCard, unfocusedContainerColor = BgCard),
                    singleLine = true
                )
            }

            item {
                OutlinedTextField(
                    value = bio,
                    onValueChange = { bio = it },
                    label = { Text("Cuéntanos sobre tu experiencia") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = NeonPink, unfocusedBorderColor = TextTertiary, focusedTextColor = TextPrimary, unfocusedTextColor = TextPrimary, cursorColor = NeonPink, focusedContainerColor = BgCard, unfocusedContainerColor = BgCard),
                    maxLines = 5
                )
            }

            item {
                // Document upload
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = BgCard)
                ) {
                    Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.UploadFile, contentDescription = null, tint = NeonBlue, modifier = Modifier.size(24.dp))
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text("Sube tu certificado o título", fontWeight = FontWeight.Bold, color = TextPrimary, fontSize = 14.sp)
                            Text("PDF o imagen (máx. 10MB)", color = TextTertiary, fontSize = 12.sp)
                        }
                    }
                }
            }

            item {
                Button(
                    onClick = { isSubmitting = true; submitted = true },
                    enabled = instrumento.isNotBlank() && bio.isNotBlank() && !isSubmitting,
                    modifier = Modifier.fillMaxWidth().height(52.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = NeonPink)
                ) {
                    Text("Enviar solicitud", fontWeight = FontWeight.Bold, fontSize = 15.sp)
                }
            }
        }
    }
}
