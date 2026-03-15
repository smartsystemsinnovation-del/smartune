package com.smartune.app.ui.screens

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
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
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import com.smartune.app.navigation.Screen
import com.smartune.app.ui.theme.SmartuneColors
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.gotrue.auth
import io.github.jan.supabase.gotrue.providers.builtin.Email
import kotlinx.coroutines.launch

@Composable
fun AuthScreen(navController: NavHostController, supabaseClient: SupabaseClient) {
    var isLogin by remember { mutableStateOf(true) }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }
    var errorMsg by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(SmartuneColors.Background),
        contentAlignment = Alignment.Center
    ) {
        Card(
            shape = RoundedCornerShape(32.dp),
            colors = CardDefaults.cardColors(containerColor = SmartuneColors.Surface),
            modifier = Modifier
                .padding(24.dp)
                .fillMaxWidth()
                .border(1.dp, SmartuneColors.Border, RoundedCornerShape(32.dp))
        ) {
            Column(
                modifier = Modifier.padding(32.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Glowing Avatar
                Box(
                    modifier = Modifier
                        .size(80.dp)
                        .background(
                            Brush.radialGradient(listOf(SmartuneColors.Primary.copy(alpha = 0.6f), Color.Transparent)),
                            CircleShape
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(Icons.Default.MusicNote, contentDescription = null, tint = Color.White, modifier = Modifier.size(40.dp))
                }

                Spacer(modifier = Modifier.height(16.dp))
                Text("SmarTune", color = Color.White, fontSize = 28.sp, fontWeight = FontWeight.ExtraBold)
                Text(
                    if (isLogin) "Inicia sesión para continuar" else "Crea tu cuenta",
                    color = Color.Gray, fontSize = 14.sp
                )

                Spacer(modifier = Modifier.height(32.dp))

                // Email field
                OutlinedTextField(
                    value = email,
                    onValueChange = { email = it },
                    label = { Text("Correo electrónico") },
                    leadingIcon = { Icon(Icons.Default.Email, contentDescription = null) },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = SmartuneColors.Primary,
                        unfocusedBorderColor = SmartuneColors.Border,
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White,
                        focusedLabelColor = SmartuneColors.Primary
                    ),
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp)
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Password field
                OutlinedTextField(
                    value = password,
                    onValueChange = { password = it },
                    label = { Text("Contraseña") },
                    leadingIcon = { Icon(Icons.Default.Lock, contentDescription = null) },
                    singleLine = true,
                    visualTransformation = PasswordVisualTransformation(),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = SmartuneColors.Primary,
                        unfocusedBorderColor = SmartuneColors.Border,
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White,
                        focusedLabelColor = SmartuneColors.Primary
                    ),
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp)
                )

                Spacer(modifier = Modifier.height(24.dp))

                // Error message
                errorMsg?.let {
                    Text(it, color = Color.Red, fontSize = 12.sp, textAlign = TextAlign.Center)
                    Spacer(modifier = Modifier.height(8.dp))
                }

                // Primary button
                Button(
                    onClick = {
                        scope.launch {
                            isLoading = true
                            errorMsg = null
                            try {
                                if (isLogin) {
                                    supabaseClient.auth.signInWith(Email) {
                                        this.email = email
                                        this.password = password
                                    }
                                } else {
                                    supabaseClient.auth.signUpWith(Email) {
                                        this.email = email
                                        this.password = password
                                    }
                                }
                                navController.navigate(Screen.Home.route) {
                                    popUpTo(Screen.Auth.route) { inclusive = true }
                                }
                            } catch (e: Exception) {
                                errorMsg = e.message ?: "Error de autenticación"
                            } finally {
                                isLoading = false
                            }
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent),
                    shape = RoundedCornerShape(16.dp),
                    contentPadding = PaddingValues(0.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .background(
                                Brush.horizontalGradient(listOf(SmartuneColors.Primary, SmartuneColors.PrimaryDark)),
                                RoundedCornerShape(16.dp)
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        if (isLoading) {
                            CircularProgressIndicator(color = Color.White, modifier = Modifier.size(24.dp), strokeWidth = 2.dp)
                        } else {
                            Text(
                                if (isLogin) "INICIAR SESIÓN" else "REGISTRARSE",
                                fontWeight = FontWeight.ExtraBold,
                                letterSpacing = 2.sp,
                                fontSize = 16.sp
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Toggle
                TextButton(onClick = { isLogin = !isLogin; errorMsg = null }) {
                    Text(
                        if (isLogin) "¿No tienes cuenta? Regístrate" else "¿Ya tienes cuenta? Inicia sesión",
                        color = SmartuneColors.Primary,
                        fontSize = 13.sp
                    )
                }
            }
        }
    }
}
