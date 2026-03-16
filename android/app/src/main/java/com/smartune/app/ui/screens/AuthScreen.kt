package com.smartune.app.ui.screens

import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.browser.customtabs.CustomTabsIntent
import androidx.compose.animation.*
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import com.smartune.app.navigation.Screen
import com.smartune.app.ui.components.GoogleLogo
import com.smartune.app.ui.components.NeonGradientButton
import com.smartune.app.ui.components.NeonTextField
import com.smartune.app.ui.theme.SmartuneColors
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.gotrue.auth
import io.github.jan.supabase.gotrue.providers.builtin.Email
import kotlinx.coroutines.launch

@Composable
fun AuthScreen(navController: NavHostController, supabaseClient: SupabaseClient) {
    var isLogin by remember { mutableStateOf(true) }
    var email by remember { mutableStateOf("") }
    var username by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }
    var isLoading by remember { mutableStateOf(false) }
    var isGoogleLoading by remember { mutableStateOf(false) }
    var errorMsg by remember { mutableStateOf<String?>(null) }
    var successMsg by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()
    val context = LocalContext.current

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    colors = listOf(
                        Color(0xFF1A0033),
                        Color(0xFF0D001A),
                        SmartuneColors.Background
                    )
                )
            )
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 28.dp)
                .padding(top = 56.dp, bottom = 24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // ── Logo + Brand ──
            AnimatedContent(targetState = isLogin, label = "logo") { login ->
                if (login) {
                    // Login: Smaller logo left-aligned like Figma
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Box(
                            modifier = Modifier
                                .size(34.dp)
                                .background(
                                    SmartuneColors.GradientButton,
                                    RoundedCornerShape(10.dp)
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                Icons.Default.GraphicEq,
                                contentDescription = null,
                                tint = Color.White,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(
                            "SmarTune",
                            color = Color.White,
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                } else {
                    // Register: Centered brand name like Figma
                    Text(
                        "SmarTune",
                        color = Color.White,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.fillMaxWidth(),
                        textAlign = TextAlign.Center
                    )
                }
            }

            Spacer(modifier = Modifier.height(36.dp))

            // ── Title ──
            Column(modifier = Modifier.fillMaxWidth()) {
                AnimatedContent(targetState = isLogin, label = "title") { login ->
                    Column {
                        if (login) {
                            Text(
                                "Bienvenido de",
                                color = Color.White,
                                fontSize = 32.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                "Vuelta",
                                color = SmartuneColors.Primary,
                                fontSize = 32.sp,
                                fontWeight = FontWeight.ExtraBold,
                                fontStyle = FontStyle.Italic
                            )
                        } else {
                            Text(
                                "Crea tu ",
                                color = Color.White,
                                fontSize = 32.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                "Cuenta",
                                color = SmartuneColors.Primary,
                                fontSize = 32.sp,
                                fontWeight = FontWeight.ExtraBold,
                                fontStyle = FontStyle.Italic
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                "Únete a la revolución musical inteligente.",
                                color = SmartuneColors.TextSecondary,
                                fontSize = 14.sp
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(28.dp))

            // ── Username (Register only) ──
            AnimatedVisibility(
                visible = !isLogin,
                enter = fadeIn() + expandVertically(),
                exit = fadeOut() + shrinkVertically()
            ) {
                Column {
                    Text("Username", color = Color.White, fontSize = 14.sp, fontWeight = FontWeight.Medium)
                    Spacer(modifier = Modifier.height(8.dp))
                    NeonTextField(
                        value = username,
                        onValueChange = { username = it },
                        placeholder = "Elige un nombre de usuario",
                        leadingIcon = Icons.Default.Person,
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                }
            }

            // ── Email ──
            Text(
                "Email",
                color = Color.White,
                fontSize = 14.sp,
                fontWeight = FontWeight.Medium,
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(modifier = Modifier.height(8.dp))
            NeonTextField(
                value = email,
                onValueChange = { email = it },
                placeholder = if (isLogin) "nombre@ejemplo.com" else "tu@email.com",
                leadingIcon = Icons.Default.Email,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(16.dp))

            // ── Password ──
            Text(
                if (isLogin) "Contraseña" else "Password",
                color = Color.White,
                fontSize = 14.sp,
                fontWeight = FontWeight.Medium,
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(modifier = Modifier.height(8.dp))
            NeonTextField(
                value = password,
                onValueChange = { password = it },
                placeholder = if (isLogin) "••••••••" else "Mínimo 8 caracteres",
                leadingIcon = Icons.Default.Lock,
                visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                trailingIcon = {
                    IconButton(onClick = { passwordVisible = !passwordVisible }) {
                        Icon(
                            if (passwordVisible) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                            contentDescription = null,
                            tint = SmartuneColors.TextSecondary
                        )
                    }
                },
                modifier = Modifier.fillMaxWidth()
            )

            // ── Forgot Password (Login only) ──
            if (isLogin) {
                Spacer(modifier = Modifier.height(8.dp))
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
                    TextButton(onClick = {
                        navController.navigate(Screen.ForgotPassword.route)
                    }) {
                        Text(
                            "¿Olvidaste tu contraseña?",
                            color = SmartuneColors.Primary,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // ── Error / Success messages ──
            errorMsg?.let {
                Card(
                    colors = CardDefaults.cardColors(containerColor = Color(0x33FF4444)),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        it,
                        color = Color(0xFFFF6666),
                        fontSize = 13.sp,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(12.dp).fillMaxWidth()
                    )
                }
                Spacer(modifier = Modifier.height(12.dp))
            }
            successMsg?.let {
                Card(
                    colors = CardDefaults.cardColors(containerColor = Color(0x3344FF44)),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        it,
                        color = Color(0xFF66FF66),
                        fontSize = 13.sp,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(12.dp).fillMaxWidth()
                    )
                }
                Spacer(modifier = Modifier.height(12.dp))
            }

            // ── Primary CTA button ──
            NeonGradientButton(
                text = if (isLogin) "Inicia Sesión" else "Regístrate",
                isLoading = isLoading,
                onClick = {
                    scope.launch {
                        isLoading = true
                        errorMsg = null
                        successMsg = null
                        try {
                            if (isLogin) {
                                supabaseClient.auth.signInWith(Email) {
                                    this.email = email
                                    this.password = password
                                }
                                navController.navigate(Screen.Home.route) {
                                    popUpTo(Screen.Auth.route) { inclusive = true }
                                }
                            } else {
                                supabaseClient.auth.signUpWith(Email) {
                                    this.email = email
                                    this.password = password
                                }
                                successMsg = "¡Cuenta creada! Revisa tu correo para confirmar."
                                isLogin = true
                            }
                        } catch (e: Exception) {
                            errorMsg = parseAuthError(e.message ?: "Error de autenticación")
                        } finally {
                            isLoading = false
                        }
                    }
                }
            )

            Spacer(modifier = Modifier.height(24.dp))

            // ── Divider "o" ──
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth()
            ) {
                Divider(color = SmartuneColors.Border, modifier = Modifier.weight(1f))
                Text(
                    "  o  ",
                    color = SmartuneColors.TextMuted,
                    fontSize = 13.sp
                )
                Divider(color = SmartuneColors.Border, modifier = Modifier.weight(1f))
            }

            Spacer(modifier = Modifier.height(24.dp))

            // ── Google Sign-In Button (Figma-faithful) ──
            OutlinedButton(
                onClick = {
                    scope.launch {
                        isGoogleLoading = true
                        errorMsg = null
                        try {
                            launchGoogleSignIn(supabaseClient, context)
                        } catch (e: Exception) {
                            errorMsg = "Error con Google: ${e.message}"
                        } finally {
                            isGoogleLoading = false
                        }
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(54.dp),
                shape = RoundedCornerShape(14.dp),
                border = BorderStroke(1.dp, Color(0xFFDDDDDD)),
                colors = ButtonDefaults.outlinedButtonColors(containerColor = Color.White),
                contentPadding = PaddingValues(horizontal = 16.dp)
            ) {
                if (isGoogleLoading) {
                    CircularProgressIndicator(
                        color = Color.DarkGray,
                        modifier = Modifier.size(20.dp),
                        strokeWidth = 2.dp
                    )
                } else {
                    // Google "G" logo built with colored circles to match Figma
                    GoogleLogo(modifier = Modifier.size(20.dp))
                    Spacer(modifier = Modifier.width(12.dp))
                    Text(
                        "Continuar con Google",
                        color = Color(0xFF3C4043),
                        fontWeight = FontWeight.Medium,
                        fontSize = 15.sp
                    )
                }
            }

            Spacer(modifier = Modifier.weight(1f))
            Spacer(modifier = Modifier.height(24.dp))

            // ── Toggle Login / Register ──
            Row(
                horizontalArrangement = Arrangement.Center,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    if (isLogin) "¿No tienes cuenta?  " else "¿Ya tienes cuenta?  ",
                    color = SmartuneColors.TextSecondary,
                    fontSize = 14.sp
                )
                Text(
                    if (isLogin) "Regístrate" else "Inicia Sesión",
                    color = SmartuneColors.Primary,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.clickable {
                        isLogin = !isLogin
                        errorMsg = null
                        successMsg = null
                    }
                )
            }

            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}

/**
 * Launches Google Sign-In via Supabase OAuth in a Custom Chrome Tab.
 * This builds the OAuth URL manually and opens it in a browser/custom tab,
 * which then redirects back to smartune-auth://callback after auth completion.
 */
private suspend fun launchGoogleSignIn(supabaseClient: SupabaseClient, context: Context) {
    val supabaseUrl = "https://mpsmvszyzrtxwadmjuei.supabase.co"
    val redirectTo = "smartune-auth://callback"

    val authUrl = "$supabaseUrl/auth/v1/authorize?" +
            "provider=google" +
            "&redirect_to=${Uri.encode(redirectTo)}" +
            "&flowType=pkce"

    val customTabsIntent = CustomTabsIntent.Builder()
        .setShowTitle(true)
        .build()

    customTabsIntent.launchUrl(context, Uri.parse(authUrl))
}


/**
 * Translates raw Supabase error messages into clean, user-friendly Spanish strings.
 */
private fun parseAuthError(raw: String): String {
    val lower = raw.lowercase()
    return when {
        "email not confirmed" in lower -> "Tu correo no ha sido confirmado. Revisa tu bandeja de entrada."
        "invalid login credentials" in lower -> "Email o contraseña incorrectos."
        "user already registered" in lower -> "Este correo ya está registrado. Intenta iniciar sesión."
        "password" in lower && "short" in lower -> "La contraseña debe tener al menos 8 caracteres."
        "email" in lower && "valid" in lower -> "Ingresa un correo electrónico válido."
        "network" in lower || "connection" in lower -> "Error de conexión. Verifica tu internet."
        "rate limit" in lower -> "Demasiados intentos. Espera un momento e inténtalo de nuevo."
        "signup" in lower && "disabled" in lower -> "El registro está deshabilitado temporalmente."
        else -> {
            // Try to extract just the message from long Supabase error strings
            val msgMatch = Regex("\"message\"\\s*:\\s*\"([^\"]+)\"").find(raw)
            val errorMatch = Regex("\"error\"\\s*:\\s*\"([^\"]+)\"").find(raw)
            val descMatch = Regex("\"error_description\"\\s*:\\s*\"([^\"]+)\"").find(raw)
            descMatch?.groupValues?.get(1)
                ?: msgMatch?.groupValues?.get(1)
                ?: errorMatch?.groupValues?.get(1)
                ?: if (raw.length > 100) "Error de autenticación. Inténtalo de nuevo." else raw
        }
    }
}
