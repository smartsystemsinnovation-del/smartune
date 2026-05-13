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
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.AsyncImage
import com.smartune.app.core.navigation.Routes
import com.smartune.app.core.theme.*
import com.smartune.app.home.viewmodel.HomeViewModel
import com.smartune.app.core.network.model.Cancion
import com.smartune.app.core.network.model.Instrumento
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.withStyle
import androidx.compose.material.ExperimentalMaterialApi
import androidx.compose.material.pullrefresh.PullRefreshIndicator
import androidx.compose.material.pullrefresh.pullRefresh
import androidx.compose.material.pullrefresh.rememberPullRefreshState

@OptIn(ExperimentalMaterialApi::class)
@Composable
fun HomeScreen(
    navController: NavController,
    homeViewModel: HomeViewModel = viewModel()
) {
    val uiState by homeViewModel.uiState.collectAsStateWithLifecycle()

    val pullRefreshState = rememberPullRefreshState(
        refreshing = uiState.isRefreshing,
        onRefresh = { homeViewModel.refresh() }
    )

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(BgMain)
            .pullRefresh(pullRefreshState)
    ) {
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
                QuickAction(icon = Icons.Default.Swipe, label = "MusicSwipe", color = NeonPink, modifier = Modifier.weight(1f)) {
                    navController.navigate(Routes.MUSIC_SWIPE)
                }
                QuickAction(icon = Icons.Default.SportsEsports, label = "Minijuegos", color = NeonPurple, modifier = Modifier.weight(1f)) {
                    navController.navigate(Routes.MINIJUEGOS)
                }
                QuickAction(icon = Icons.Default.AutoAwesome, label = "IA-Studio", color = NeonBlue, modifier = Modifier.weight(1f)) {
                    navController.navigate(Routes.IA_STUDIO)
                }
            }
        }

        // Mis Clases section
        item {
            Column {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.VideoCall, contentDescription = null, tint = NeonBlue, modifier = Modifier.size(24.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Clases de Hoy", fontWeight = FontWeight.Bold, fontSize = 20.sp, color = TextPrimary)
                }
                Spacer(modifier = Modifier.height(12.dp))
                
                if (uiState.misClases.isEmpty()) {
                    Card(
                        modifier = Modifier.fillMaxWidth().clickable { 
                            if (!uiState.isProfesor) navController.navigate(Routes.PROFESORES) 
                        },
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = BgCard)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text("No tienes clases programadas para hoy", color = TextSecondary, fontSize = 14.sp)
                            Spacer(modifier = Modifier.height(8.dp))
                            if (uiState.isProfesor) {
                                Text("Tus alumnos agendarán clases contigo", color = NeonPink, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                            } else {
                                Text("Toca aquí para buscar un profesor", color = NeonPink, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                            }
                        }
                    }
                } else {
                    LazyRow(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        items(uiState.misClases) { clase ->
                            Card(
                                modifier = Modifier.width(280.dp),
                                shape = RoundedCornerShape(16.dp),
                                colors = CardDefaults.cardColors(containerColor = BgCard)
                            ) {
                                Column(modifier = Modifier.padding(16.dp)) {
                                    Text(clase.titulo, fontWeight = FontWeight.Bold, color = TextPrimary, fontSize = 16.sp, maxLines = 1, overflow = androidx.compose.ui.text.style.TextOverflow.Ellipsis)
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text("Con ${if(uiState.isAlumnosView) clase.profesorNombre else clase.alumnoNombre}", color = TextSecondary, fontSize = 13.sp)
                                    Spacer(modifier = Modifier.height(8.dp))
                                    
                                    val timeString = try {
                                        val str = clase.fechaInicio.replace(" ", "T")
                                        val time = try {
                                            java.time.Instant.parse(str)
                                        } catch(e: Exception) {
                                            java.time.LocalDateTime.parse(str.substringBefore("+").substringBefore("Z"))
                                                .toInstant(java.time.ZoneOffset.UTC)
                                        }
                                        val formatter = java.time.format.DateTimeFormatter.ofPattern("HH:mm").withZone(java.time.ZoneId.systemDefault())
                                        formatter.format(time)
                                    } catch(e: Exception) { "Hora pendiente" }
                                    
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Icon(Icons.Default.Schedule, contentDescription = null, tint = TextTertiary, modifier = Modifier.size(16.dp))
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text(timeString, color = TextTertiary, fontSize = 12.sp)
                                    }
                                    
                                    Spacer(modifier = Modifier.height(12.dp))
                                    if (clase.meetLink != null) {
                                        Button(
                                            onClick = { /* Handle Meet join */ },
                                            colors = ButtonDefaults.buttonColors(containerColor = NeonBlue),
                                            modifier = Modifier.fillMaxWidth().height(40.dp),
                                            shape = RoundedCornerShape(12.dp)
                                        ) {
                                            Icon(Icons.Default.VideoCall, contentDescription = null, modifier = Modifier.size(18.dp))
                                            Spacer(modifier = Modifier.width(8.dp))
                                            Text("Unirse a la clase", fontWeight = FontWeight.Bold)
                                        }
                                    } else {
                                        Text("Esperando enlace de Meet...", color = NeonPink, fontSize = 12.sp, fontStyle = androidx.compose.ui.text.font.FontStyle.Italic)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // Become a teacher
        if (!uiState.isProfesor) {
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

        item { Spacer(modifier = Modifier.height(16.dp)) }

        // Top Instrumentos
        item {
            TopInstrumentosSection(
                instrumentos = uiState.instrumentos,
                isAlumnosView = uiState.isAlumnosView,
                onToggleView = { homeViewModel.toggleInstrumentosView() }
            )
        }

        item { Spacer(modifier = Modifier.height(16.dp)) }

        // Nuevos Lanzamientos
        item {
            NuevosLanzamientosSection(
                canciones = uiState.lanzamientos,
                onCancionClick = { cancionId ->
                    navController.navigate(Routes.player(cancionId))
                }
            )
        }

        item { Spacer(modifier = Modifier.height(32.dp)) }

        // Nosotros Footer
        item {
            NosotrosFooter()
        }
        
        item { Spacer(modifier = Modifier.height(32.dp)) }
    }

    PullRefreshIndicator(
        refreshing = uiState.isRefreshing,
        state = pullRefreshState,
        modifier = Modifier.align(Alignment.TopCenter),
        backgroundColor = BgCard,
        contentColor = NeonPink
    )
  }
}

@Composable
private fun TopInstrumentosSection(
    instrumentos: List<Instrumento>,
    isAlumnosView: Boolean,
    onToggleView: () -> Unit
) {
    Column {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = buildAnnotatedString {
                    append("Top ")
                    withStyle(SpanStyle(color = NeonPink)) { append("Instrumentos") }
                },
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimary
            )
            
            // Toggle Switch
            Surface(
                shape = RoundedCornerShape(20.dp),
                color = BgCard.copy(alpha = 0.5f),
                modifier = Modifier.clickable { onToggleView() }
            ) {
                Row(modifier = Modifier.padding(4.dp)) {
                    Box(
                        modifier = Modifier
                            .background(
                                color = if (isAlumnosView) NeonPink else androidx.compose.ui.graphics.Color.Transparent,
                                shape = RoundedCornerShape(16.dp)
                            )
                            .padding(horizontal = 12.dp, vertical = 6.dp)
                    ) {
                        Text("Alumnos", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = if (isAlumnosView) TextPrimary else TextSecondary)
                    }
                    Box(
                        modifier = Modifier
                            .background(
                                color = if (!isAlumnosView) NeonPink else androidx.compose.ui.graphics.Color.Transparent,
                                shape = RoundedCornerShape(16.dp)
                            )
                            .padding(horizontal = 12.dp, vertical = 6.dp)
                    ) {
                        Text("Profesores", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = if (!isAlumnosView) TextPrimary else TextSecondary)
                    }
                }
            }
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        val filteredInstrumentos = if (isAlumnosView) {
            instrumentos.filter { it.totalAlumnos > 0 }.sortedByDescending { it.totalAlumnos }.take(10)
        } else {
            instrumentos.filter { it.totalProfesores > 0 }.sortedByDescending { it.totalProfesores }.take(10)
        }
        
        if (filteredInstrumentos.isEmpty()) {
            Text(
                text = "Ningún dato registrado aún.",
                fontStyle = androidx.compose.ui.text.font.FontStyle.Italic,
                color = TextSecondary,
                modifier = Modifier.padding(16.dp)
            )
        } else {
            LazyRow(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                items(filteredInstrumentos) { instrumento ->
                    Card(
                        modifier = Modifier.width(160.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = BgCard)
                    ) {
                        Column {
                            AsyncImage(
                                model = instrumento.imagenUrl,
                                contentDescription = instrumento.nombre,
                                contentScale = ContentScale.Crop,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(100.dp)
                                    .clip(RoundedCornerShape(topStart = 12.dp, topEnd = 12.dp))
                            )
                            Column(modifier = Modifier.padding(12.dp)) {
                                Text(instrumento.nombre, fontWeight = FontWeight.Bold, fontSize = 14.sp, color = TextPrimary)
                                Spacer(modifier = Modifier.height(4.dp))
                                
                                val amountText = if (isAlumnosView) {
                                    if (instrumento.totalAlumnos == 1) "1 persona" else "${instrumento.totalAlumnos} personas"
                                } else {
                                    if (instrumento.totalProfesores == 1) "1 profesor" else "${instrumento.totalProfesores} profesores"
                                }
                                
                                Text(
                                    text = amountText,
                                    fontSize = 12.sp,
                                    color = TextSecondary
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun NuevosLanzamientosSection(
    canciones: List<Cancion>,
    onCancionClick: (String) -> Unit
) {
    Column {
        Text(
            text = buildAnnotatedString {
                append("Nuevos ")
                withStyle(SpanStyle(color = NeonPink)) { append("Lanzamientos") }
            },
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold,
            color = TextPrimary
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        LazyRow(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
            items(canciones) { cancion ->
                Card(
                    modifier = Modifier.width(120.dp).clickable { onCancionClick(cancion.id) },
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = BgCard)
                ) {
                    Column {
                        if (cancion.coverUrl != null) {
                            AsyncImage(
                                model = cancion.coverUrl,
                                contentDescription = cancion.titulo,
                                contentScale = ContentScale.Crop,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(120.dp)
                                    .clip(RoundedCornerShape(topStart = 12.dp, topEnd = 12.dp))
                            )
                        } else {
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(120.dp)
                                    .background(BgCardHover),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(Icons.Default.MusicNote, contentDescription = null, tint = TextTertiary, modifier = Modifier.size(48.dp))
                            }
                        }
                        
                        Column(modifier = Modifier.padding(12.dp)) {
                            Text(
                                cancion.titulo, 
                                fontWeight = FontWeight.Bold, 
                                fontSize = 12.sp, 
                                color = TextPrimary,
                                maxLines = 1,
                                overflow = androidx.compose.ui.text.style.TextOverflow.Ellipsis
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                cancion.artista ?: "SmarTune", 
                                fontSize = 10.sp, 
                                color = TextSecondary,
                                maxLines = 1,
                                overflow = androidx.compose.ui.text.style.TextOverflow.Ellipsis
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun NosotrosFooter() {
    Column(modifier = Modifier.fillMaxWidth().padding(vertical = 16.dp)) {
        HorizontalDivider(color = BgCard, thickness = 1.dp)
        Spacer(modifier = Modifier.height(32.dp))
        
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.Top) {
            Column(modifier = Modifier.weight(1f)) {
                Text("Nosotros", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
                Spacer(modifier = Modifier.height(12.dp))
                Text(
                    "SmarTune es una plataforma creada para revolucionar el aprendizaje musical. En este lugar podrás escuchar, practicar y aprender usando nuestros algoritmos de retención de la familia Ebbinghaus. Únete a nuestro plan premium para desbloquear todo el potencial.",
                    fontSize = 11.sp,
                    color = TextSecondary,
                    lineHeight = 16.sp
                )
            }
            Spacer(modifier = Modifier.width(16.dp))
            Column(horizontalAlignment = Alignment.End) {
                Text(
                    text = buildAnnotatedString {
                        append("Smar")
                        withStyle(SpanStyle(color = NeonBlue)) { append("Tune") }
                    },
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold,
                    color = NeonPink
                )
                Spacer(modifier = Modifier.height(12.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    // Placeholder icons for Facebook, Instagram, Twitter
                    Icon(Icons.Default.Public, contentDescription = "Facebook", tint = TextSecondary, modifier = Modifier.size(20.dp))
                    Icon(Icons.Default.CameraAlt, contentDescription = "Instagram", tint = TextSecondary, modifier = Modifier.size(20.dp))
                    Icon(Icons.Default.Tag, contentDescription = "X", tint = TextSecondary, modifier = Modifier.size(20.dp))
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
