package com.smartune.app.profile.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import coil.compose.AsyncImage
import com.smartune.app.core.navigation.Routes
import com.smartune.app.core.supabase.SupabaseClient
import com.smartune.app.core.theme.*
import com.smartune.app.explorar.data.models.UserProfile
import com.smartune.app.explorar.data.repository.SocialRepository
import kotlinx.coroutines.launch

@Composable
fun ProfileScreen(navController: NavController, onLogout: () -> Unit) {
    val scope = rememberCoroutineScope()
    val repo = remember { SocialRepository() }
    var profile by remember { mutableStateOf<UserProfile?>(null) }
    var isEditing by remember { mutableStateOf(false) }
    var editName by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(true) }

    LaunchedEffect(Unit) {
        profile = repo.getProfile()
        editName = profile?.nombre ?: ""
        isLoading = false
    }

    LazyColumn(
        modifier = Modifier.fillMaxSize().background(BgMain),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text("Perfil", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
        }

        if (isLoading) {
            item {
                Box(modifier = Modifier.fillMaxWidth().padding(48.dp), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = NeonPink, modifier = Modifier.size(32.dp))
                }
            }
        } else {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = BgCard)
                ) {
                    Column(
                        modifier = Modifier.fillMaxWidth().padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        // Avatar
                        Box(
                            modifier = Modifier
                                .size(96.dp)
                                .clip(CircleShape)
                                .background(
                                    brush = Brush.linearGradient(listOf(NeonPink, NeonPurple, NeonBlue)),
                                    shape = CircleShape
                                )
                        ) {
                            AsyncImage(
                                model = profile?.avatarUrl
                                    ?: "https://ui-avatars.com/api/?background=f6339a&color=fff&bold=true&size=128&name=${profile?.nombre ?: "U"}",
                                contentDescription = null,
                                modifier = Modifier.fillMaxSize().padding(3.dp).clip(CircleShape),
                                contentScale = ContentScale.Crop
                            )
                        }

                        Spacer(modifier = Modifier.height(16.dp))
                        Text(profile?.nombre ?: "Usuario", fontWeight = FontWeight.Bold, fontSize = 20.sp, color = TextPrimary)
                        Text(profile?.email ?: "", fontSize = 13.sp, color = TextTertiary)
                        Spacer(modifier = Modifier.height(8.dp))

                        // Role badge
                        val rolLabel = if (profile?.profesorAprobado == true) "Profesor Verificado" else "Alumno"
                        val rolColor = if (profile?.profesorAprobado == true) NeonBlue else NeonPink
                        Card(
                            shape = RoundedCornerShape(20.dp),
                            colors = CardDefaults.cardColors(containerColor = rolColor.copy(alpha = 0.15f))
                        ) {
                            Text(
                                rolLabel,
                                color = rolColor,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                            )
                        }
                    }
                }
            }

            // Edit Name Section
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = BgCard)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("Editar perfil", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = TextPrimary)
                        Spacer(modifier = Modifier.height(12.dp))
                        OutlinedTextField(
                            value = editName,
                            onValueChange = { editName = it },
                            label = { Text("Nombre") },
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(12.dp),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = NeonPink,
                                unfocusedBorderColor = TextTertiary,
                                focusedTextColor = TextPrimary,
                                unfocusedTextColor = TextPrimary,
                                cursorColor = NeonPink,
                                focusedContainerColor = BgMain,
                                unfocusedContainerColor = BgMain,
                            ),
                            singleLine = true
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Button(
                            onClick = {
                                scope.launch {
                                    repo.updateProfile(editName)
                                    profile = repo.getProfile()
                                }
                            },
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = NeonPink)
                        ) {
                            Text("Guardar cambios", fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }

            // Menu options
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = BgCard)
                ) {
                    Column {
                        if (profile?.profesorAprobado == true) {
                            MenuOption(Icons.Default.Dashboard, "Panel de Profesor", NeonBlue) {
                                navController.navigate(Routes.TEACHER_DASHBOARD)
                            }
                            HorizontalDivider(color = TextTertiary.copy(0.1f))
                        }
                        MenuOption(Icons.Default.Star, "Premium", NeonPink) {
                            navController.navigate(Routes.PREMIUM)
                        }
                        HorizontalDivider(color = TextTertiary.copy(0.1f))
                        MenuOption(Icons.Default.Settings, "Configuración", TextSecondary) {}
                        HorizontalDivider(color = TextTertiary.copy(0.1f))
                        MenuOption(Icons.Default.Logout, "Cerrar sesión", NeonPink) {
                            scope.launch {
                                try { SupabaseClient.auth.signOut() } catch (_: Exception) {}
                                onLogout()
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun MenuOption(icon: androidx.compose.ui.graphics.vector.ImageVector, label: String, tint: androidx.compose.ui.graphics.Color, onClick: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(icon, contentDescription = null, tint = tint, modifier = Modifier.size(22.dp))
        Spacer(modifier = Modifier.width(12.dp))
        Text(label, fontSize = 14.sp, color = TextPrimary, fontWeight = FontWeight.Medium, modifier = Modifier.weight(1f))
        Icon(Icons.Default.ChevronRight, contentDescription = null, tint = TextTertiary, modifier = Modifier.size(20.dp))
    }
}
