package com.smartune.app.teacher.ui

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
    var refreshTrigger by remember { mutableIntStateOf(0) }
    val context = LocalContext.current

    LaunchedEffect(refreshTrigger) {
        isLoading = true
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
                colors = ButtonDefaults.buttonColors(containerColor = NeonCyan)
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
                    modifier = Modifier.fillMaxWidth().border(1.dp, NeonPink.copy(0.2f), RoundedCornerShape(16.dp)),
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
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.VideoCall, contentDescription = null, tint = NeonCyan, modifier = Modifier.size(20.dp))
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(clase.titulo, fontWeight = FontWeight.Bold, color = TextPrimary, fontSize = 15.sp)
                            }
                            IconButton(onClick = {
                                scope.launch {
                                    val ok = repo.borrarClase(clase.id)
                                    if (ok) {
                                        refreshTrigger++
                                    }
                                }
                            }) {
                                Icon(Icons.Default.Delete, contentDescription = "Borrar", tint = NeonPink, modifier = Modifier.size(20.dp))
                            }
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Text("Alumno: ${clase.alumnoNombre}", color = TextSecondary, fontSize = 13.sp)
                        Text("Fecha: ${clase.fechaInicio}", color = TextTertiary, fontSize = 12.sp)

                        clase.meetLink?.let { link ->
                            Spacer(modifier = Modifier.height(12.dp))
                            Button(
                                onClick = {
                                    try {
                                        var finalLink = link
                                        if (!finalLink.startsWith("http://") && !finalLink.startsWith("https://")) {
                                            finalLink = "https://$finalLink"
                                        }
                                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(finalLink))
                                        context.startActivity(intent)
                                    } catch (e: Exception) {
                                        e.printStackTrace()
                                        android.widget.Toast.makeText(context, "No se encontró una app para abrir el enlace", android.widget.Toast.LENGTH_SHORT).show()
                                    }
                                },
                                shape = RoundedCornerShape(20.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = NeonCyan),
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
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CrearClaseScreen(navController: NavController) {
    val scope = rememberCoroutineScope()
    val repo = remember { SocialRepository() }
    
    var titulo by remember { mutableStateOf("") }
    var instrumento by remember { mutableStateOf("") }
    var isCreating by remember { mutableStateOf(false) }

    // Date & Time State
    var date by remember { mutableStateOf("") }
    var time by remember { mutableStateOf("") }
    var errorMessage by remember { mutableStateOf("") }

    // Autocomplete State
    var searchQuery by remember { mutableStateOf("") }
    var selectedAlumnoId by remember { mutableStateOf("") }
    var searchResults by remember { mutableStateOf<List<com.smartune.app.explorar.data.models.UserProfile>>(emptyList()) }
    var isSearching by remember { mutableStateOf(false) }
    var expanded by remember { mutableStateOf(false) }

    // Search effect
    LaunchedEffect(searchQuery) {
        if (searchQuery.length >= 2 && !searchQuery.contains("(")) {
            isSearching = true
            expanded = true
            searchResults = repo.searchUsers(searchQuery)
            isSearching = false
        } else {
            expanded = false
        }
    }

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
                Text("Crear Clase Magistral", fontWeight = FontWeight.Bold, fontSize = 22.sp, color = TextPrimary)
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
                value = instrumento,
                onValueChange = { instrumento = it },
                label = { Text("Instrumento (Ej. Guitarra, Piano)") },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = NeonPink, unfocusedBorderColor = TextTertiary, focusedTextColor = TextPrimary, unfocusedTextColor = TextPrimary, cursorColor = NeonPink, focusedContainerColor = BgCard, unfocusedContainerColor = BgCard),
                singleLine = true
            )
        }

        item {
            ExposedDropdownMenuBox(
                expanded = expanded,
                onExpandedChange = { expanded = !expanded }
            ) {
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = {
                        searchQuery = it
                        selectedAlumnoId = "" // Reset selected if they type something new
                    },
                    label = { Text("Buscar Alumno (Nombre o Correo)") },
                    modifier = Modifier.fillMaxWidth().menuAnchor(),
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = NeonPink, unfocusedBorderColor = TextTertiary, focusedTextColor = TextPrimary, unfocusedTextColor = TextPrimary, cursorColor = NeonPink, focusedContainerColor = BgCard, unfocusedContainerColor = BgCard),
                    singleLine = true,
                    trailingIcon = {
                        if (isSearching) {
                            CircularProgressIndicator(color = NeonPink, modifier = Modifier.size(20.dp), strokeWidth = 2.dp)
                        } else {
                            Icon(Icons.Default.Search, contentDescription = "Buscar", tint = TextTertiary)
                        }
                    }
                )
                
                ExposedDropdownMenu(
                    expanded = expanded,
                    onDismissRequest = { expanded = false },
                    modifier = Modifier.background(BgCard)
                ) {
                    if (searchResults.isEmpty() && !isSearching) {
                        DropdownMenuItem(
                            text = { Text("No se encontraron resultados", color = TextTertiary) },
                            onClick = { expanded = false }
                        )
                    } else {
                        searchResults.forEach { user ->
                            DropdownMenuItem(
                                text = { 
                                    Column {
                                        Text(user.nombre, color = TextPrimary, fontWeight = FontWeight.Bold)
                                        Text(user.email, color = TextSecondary, fontSize = 12.sp)
                                    }
                                },
                                onClick = {
                                    searchQuery = "${user.nombre} (${user.email})"
                                    selectedAlumnoId = user.id
                                    expanded = false
                                }
                            )
                        }
                    }
                }
            }
        }

        item {
            val context = LocalContext.current
            val calendar = java.util.Calendar.getInstance()
            
            val datePickerDialog = android.app.DatePickerDialog(
                context,
                { _, year, month, dayOfMonth ->
                    date = String.format("%04d-%02d-%02d", year, month + 1, dayOfMonth)
                },
                calendar.get(java.util.Calendar.YEAR),
                calendar.get(java.util.Calendar.MONTH),
                calendar.get(java.util.Calendar.DAY_OF_MONTH)
            )

            val timePickerDialog = android.app.TimePickerDialog(
                context,
                { _, hourOfDay, minute ->
                    time = String.format("%02d:%02d", hourOfDay, minute)
                },
                calendar.get(java.util.Calendar.HOUR_OF_DAY),
                calendar.get(java.util.Calendar.MINUTE),
                true // 24-hour format
            )

            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                Box(modifier = Modifier.weight(1f).clickable { datePickerDialog.show() }) {
                    OutlinedTextField(
                        value = date,
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("Fecha") },
                        modifier = Modifier.fillMaxWidth(),
                        enabled = false,
                        shape = RoundedCornerShape(12.dp),
                        colors = OutlinedTextFieldDefaults.colors(disabledBorderColor = TextTertiary, disabledTextColor = TextPrimary, disabledLabelColor = TextTertiary, disabledContainerColor = BgCard),
                        trailingIcon = { Icon(Icons.Default.CalendarToday, contentDescription = null, tint = NeonPink) }
                    )
                }
                Box(modifier = Modifier.weight(1f).clickable { timePickerDialog.show() }) {
                    OutlinedTextField(
                        value = time,
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("Hora") },
                        modifier = Modifier.fillMaxWidth(),
                        enabled = false,
                        shape = RoundedCornerShape(12.dp),
                        colors = OutlinedTextFieldDefaults.colors(disabledBorderColor = TextTertiary, disabledTextColor = TextPrimary, disabledLabelColor = TextTertiary, disabledContainerColor = BgCard),
                        trailingIcon = { Icon(Icons.Default.Schedule, contentDescription = null, tint = NeonPink) }
                    )
                }
            }
        }

        if (errorMessage.isNotEmpty()) {
            item {
                Text(text = "Error: $errorMessage", color = NeonPink, fontSize = 14.sp, fontWeight = FontWeight.Bold)
            }
        }

        item {
            Spacer(modifier = Modifier.height(16.dp))
            Button(
                onClick = {
                    scope.launch {
                        isCreating = true
                        errorMessage = ""
                        val fechaInicio = "${date}T${time}:00Z"
                        val result = repo.crearClase(titulo, instrumento, selectedAlumnoId, fechaInicio, "")
                        isCreating = false
                        if (result == null) {
                            navController.popBackStack()
                        } else {
                            errorMessage = result
                        }
                    }
                },
                enabled = titulo.isNotBlank() && instrumento.isNotBlank() && selectedAlumnoId.isNotBlank() && date.length == 10 && time.length == 5 && !isCreating,
                modifier = Modifier.fillMaxWidth().height(52.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = NeonPink)
            ) {
                if (isCreating) CircularProgressIndicator(color = TextPrimary, modifier = Modifier.size(20.dp), strokeWidth = 2.dp)
                else Text("Agendar Clase", fontWeight = FontWeight.Bold, fontSize = 15.sp)
            }
        }
    }
}
