package com.smartune.app.ui.screens

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.ExperimentalLayoutApi
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
import com.smartune.app.navigation.Screen
import com.smartune.app.ui.theme.SmartuneColors
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.gotrue.auth
import io.github.jan.supabase.postgrest.postgrest
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
fun OnboardingScreen(navController: NavHostController, supabaseClient: SupabaseClient) {
    var username by remember { mutableStateOf("") }
    var profileUrl by remember { mutableStateOf("") }
    var instrument by remember { mutableStateOf("Ninguno") }
    var selectedGenres by remember { mutableStateOf(setOf<String>()) }
    var isLoading by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()

    val instruments = listOf("Ninguno", "Guitarra", "Piano", "Batería", "Bajo", "Violín", "Voz", "Otro")
    val genres = listOf("Rock", "Pop", "Hardstyle", "Phonk", "Electrónica", "Jazz", "K-Pop", "Trap", "Soundtracks", "Lo-Fi")

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(SmartuneColors.Background)
            .verticalScroll(rememberScrollState())
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(modifier = Modifier.height(32.dp))

        // Glowing Avatar
        Box(
            modifier = Modifier
                .size(100.dp)
                .background(
                    Brush.radialGradient(listOf(SmartuneColors.Accent.copy(alpha = 0.6f), Color.Transparent)),
                    CircleShape
                ),
            contentAlignment = Alignment.Center
        ) {
            Icon(Icons.Default.Person, contentDescription = null, tint = Color.White, modifier = Modifier.size(50.dp))
        }

        Spacer(modifier = Modifier.height(16.dp))
        Text("Configura tu Perfil", color = Color.White, fontSize = 28.sp, fontWeight = FontWeight.ExtraBold)
        Text("Cuéntanos sobre ti", color = SmartuneColors.Primary, fontSize = 14.sp)

        Spacer(modifier = Modifier.height(32.dp))

        // Username
        OutlinedTextField(
            value = username,
            onValueChange = { username = it },
            label = { Text("Nombre de usuario") },
            leadingIcon = { Icon(Icons.Default.Person, contentDescription = null) },
            singleLine = true,
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = SmartuneColors.Primary,
                unfocusedBorderColor = SmartuneColors.Border,
                focusedTextColor = Color.White, unfocusedTextColor = Color.White,
                focusedLabelColor = SmartuneColors.Primary
            ),
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp)
        )

        Spacer(modifier = Modifier.height(12.dp))

        // Profile URL
        OutlinedTextField(
            value = profileUrl,
            onValueChange = { profileUrl = it },
            label = { Text("URL de foto de perfil") },
            leadingIcon = { Icon(Icons.Default.Image, contentDescription = null) },
            singleLine = true,
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = SmartuneColors.Primary,
                unfocusedBorderColor = SmartuneColors.Border,
                focusedTextColor = Color.White, unfocusedTextColor = Color.White,
                focusedLabelColor = SmartuneColors.Primary
            ),
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp)
        )

        Spacer(modifier = Modifier.height(20.dp))

        // Instrument Selector
        Text("¿Qué instrumento tocas?", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)
        Spacer(modifier = Modifier.height(8.dp))
        FlowRow(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            instruments.forEach { instr ->
                FilterChip(
                    selected = instrument == instr,
                    onClick = { instrument = instr },
                    label = { Text(instr, fontSize = 12.sp) },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = SmartuneColors.Primary,
                        containerColor = SmartuneColors.GlassCard
                    ),
                    border = FilterChipDefaults.filterChipBorder(
                        borderColor = SmartuneColors.Border,
                        selectedBorderColor = SmartuneColors.Primary
                    )
                )
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Genre Tags
        Text("Gustos Musicales", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)
        Spacer(modifier = Modifier.height(8.dp))
        FlowRow(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            genres.forEach { genre ->
                val isSelected = genre in selectedGenres
                FilterChip(
                    selected = isSelected,
                    onClick = {
                        selectedGenres = if (isSelected) selectedGenres - genre else selectedGenres + genre
                    },
                    label = { Text(genre, fontSize = 12.sp) },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = SmartuneColors.Accent,
                        containerColor = SmartuneColors.GlassCard
                    ),
                    border = FilterChipDefaults.filterChipBorder(
                        borderColor = SmartuneColors.Border,
                        selectedBorderColor = SmartuneColors.Accent
                    )
                )
            }
        }

        Spacer(modifier = Modifier.height(32.dp))

        // Submit Button
        Button(
            onClick = {
                scope.launch {
                    isLoading = true
                    try {
                        val user = supabaseClient.auth.currentUserOrNull()
                        if (user != null) {
                            supabaseClient.postgrest["usuarios"].insert(
                                listOf(
                                    mapOf(
                                        "id" to user.id,
                                        "nombre_usuario" to username,
                                        "instrumento" to instrument,
                                        "gustos_musicales" to selectedGenres.joinToString(", ")
                                    )
                                )
                            )
                        }
                        navController.navigate(Screen.Home.route) {
                            popUpTo(Screen.Onboarding.route) { inclusive = true }
                        }
                    } catch (e: Exception) {
                        // Handle error (e.g., show a toast)
                    } finally {
                        isLoading = false
                    }
                }
            },
            modifier = Modifier.fillMaxWidth().height(56.dp),
            colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent),
            shape = RoundedCornerShape(16.dp),
            contentPadding = PaddingValues(0.dp)
        ) {
            Box(
                modifier = Modifier.fillMaxSize().background(
                    Brush.horizontalGradient(listOf(SmartuneColors.Primary, SmartuneColors.PrimaryDark)),
                    RoundedCornerShape(16.dp)
                ),
                contentAlignment = Alignment.Center
            ) {
                if (isLoading) {
                    CircularProgressIndicator(color = Color.White, modifier = Modifier.size(24.dp), strokeWidth = 2.dp)
                } else {
                    Text("COMENZAR", fontWeight = FontWeight.ExtraBold, letterSpacing = 2.sp, fontSize = 16.sp)
                }
            }
        }

        Spacer(modifier = Modifier.height(32.dp))
    }
}
