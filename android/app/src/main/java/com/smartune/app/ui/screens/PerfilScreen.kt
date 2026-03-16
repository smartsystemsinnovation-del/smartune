package com.smartune.app.ui.screens

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
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
import androidx.navigation.NavHostController
import com.smartune.app.data.SupabaseModule
import com.smartune.app.navigation.Screen
import com.smartune.app.ui.theme.SmartuneColors
import io.github.jan.supabase.gotrue.auth
import io.github.jan.supabase.postgrest.postgrest
import kotlinx.coroutines.launch
import kotlinx.serialization.Serializable

@Serializable
private data class UserProfile(
    val id: String? = null,
    val nombre_usuario: String? = null,
    val email: String? = null,
    val instrumento: String? = null,
    val gustos_musicales: String? = null
)

@Composable
fun PerfilScreen(navController: NavHostController) {
    val scope = rememberCoroutineScope()
    val supabase = SupabaseModule.client

    var userEmail by remember { mutableStateOf("Cargando...") }
    var userName by remember { mutableStateOf("Usuario") }
    var userInitials by remember { mutableStateOf("??") }
    var favoritosCount by remember { mutableIntStateOf(0) }
    var isLoading by remember { mutableStateOf(true) }

    // Load user data from Supabase Auth + DB
    LaunchedEffect(Unit) {
        scope.launch {
            try {
                val user = supabase.auth.currentUserOrNull()
                if (user != null) {
                    userEmail = user.email ?: "Sin email"
                    userName = user.email?.substringBefore("@") ?: "Usuario"
                    userInitials = userName.take(2).uppercase()

                    // Try to fetch profile from DB
                    try {
                        val profiles = supabase.postgrest["usuarios"]
                            .select() {
                                filter { eq("id", user.id) }
                            }
                            .decodeList<UserProfile>()
                        profiles.firstOrNull()?.let { profile ->
                            if (!profile.nombre_usuario.isNullOrBlank()) {
                                userName = profile.nombre_usuario
                                userInitials = profile.nombre_usuario.take(2).uppercase()
                            }
                        }
                    } catch (_: Exception) { }

                    // Count favoritos
                    try {
                        val favs = supabase.postgrest["favoritos"]
                            .select() {
                                filter { eq("usuario_id", user.id) }
                            }
                            .decodeList<Map<String, String>>()
                        favoritosCount = favs.size
                    } catch (_: Exception) { }
                } else {
                    userEmail = "No conectado"
                    userName = "Invitado"
                    userInitials = "??"
                }
            } catch (e: Exception) {
                userEmail = "Error"
            } finally {
                isLoading = false
            }
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(SmartuneColors.Background)
            .verticalScroll(rememberScrollState())
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(modifier = Modifier.height(16.dp))
        Text("Perfil", color = Color.White, fontSize = 34.sp, fontWeight = FontWeight.ExtraBold)
        Text(userEmail, color = SmartuneColors.Primary, fontSize = 13.sp)

        Spacer(modifier = Modifier.height(32.dp))

        // Glowing Avatar
        Box(
            modifier = Modifier
                .size(120.dp)
                .background(
                    Brush.radialGradient(listOf(SmartuneColors.Accent.copy(alpha = 0.5f), Color.Transparent), radius = 80f),
                    CircleShape
                ),
            contentAlignment = Alignment.Center
        ) {
            Box(
                modifier = Modifier
                    .size(100.dp)
                    .background(
                        Brush.linearGradient(listOf(SmartuneColors.Accent, SmartuneColors.Primary)),
                        CircleShape
                    ),
                contentAlignment = Alignment.Center
            ) {
                if (isLoading) {
                    CircularProgressIndicator(color = Color.White, modifier = Modifier.size(30.dp), strokeWidth = 2.dp)
                } else {
                    Text(userInitials, color = Color.White, fontSize = 36.sp, fontWeight = FontWeight.Bold)
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))
        Text(userName, color = Color.White, fontSize = 24.sp, fontWeight = FontWeight.Bold)

        Spacer(modifier = Modifier.height(32.dp))

        // Stats from Supabase
        Card(
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = SmartuneColors.GlassCard),
            modifier = Modifier
                .fillMaxWidth()
                .border(0.5.dp, SmartuneColors.Border, RoundedCornerShape(20.dp))
        ) {
            Column(modifier = Modifier.padding(20.dp)) {
                ProfileStatRow("Canciones Favoritas", "$favoritosCount")
                Divider(color = SmartuneColors.Border, modifier = Modifier.padding(vertical = 12.dp))
                ProfileStatRow("Email", userEmail)
                Divider(color = SmartuneColors.Border, modifier = Modifier.padding(vertical = 12.dp))
                ProfileStatRow("Base de Datos", "Supabase ✓")
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Menu Items
        listOf(
            Triple(Icons.Default.Star, "Premium", SmartuneColors.Gold),
            Triple(Icons.Default.Games, "SmarTiles", SmartuneColors.Accent),
        ).forEach { (icon, label, color) ->
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = SmartuneColors.GlassCard),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 4.dp)
                    .clickable {
                        when (label) {
                            "Premium" -> navController.navigate(Screen.Premium.route)
                            "SmarTiles" -> navController.navigate(Screen.SmarTiles.route)
                        }
                    }
                    .border(0.5.dp, SmartuneColors.Border, RoundedCornerShape(16.dp))
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(24.dp))
                    Spacer(modifier = Modifier.width(16.dp))
                    Text(label, color = Color.White, fontWeight = FontWeight.Medium, modifier = Modifier.weight(1f))
                    Icon(Icons.Default.ChevronRight, contentDescription = null, tint = Color.Gray)
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Logout (real Supabase signout)
        OutlinedButton(
            onClick = {
                scope.launch {
                    try {
                        supabase.auth.signOut()
                    } catch (_: Exception) { }
                    navController.navigate(Screen.Auth.route) { popUpTo(0) }
                }
            },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            border = BorderStroke(1.dp, Color.Red.copy(alpha = 0.5f))
        ) {
            Icon(Icons.Default.ExitToApp, contentDescription = null, tint = Color.Red.copy(alpha = 0.7f))
            Spacer(modifier = Modifier.width(8.dp))
            Text("Cerrar Sesión", color = Color.Red.copy(alpha = 0.7f), fontWeight = FontWeight.Bold)
        }

        Spacer(modifier = Modifier.height(80.dp))
    }
}

@Composable
private fun ProfileStatRow(label: String, value: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(label, color = Color.Gray, fontSize = 14.sp)
        Text(value, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
    }
}
