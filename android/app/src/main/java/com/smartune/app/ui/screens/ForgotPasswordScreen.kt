package com.smartune.app.ui.screens

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import com.smartune.app.navigation.Screen
import com.smartune.app.ui.components.NeonGradientButton
import com.smartune.app.ui.components.NeonTextField
import com.smartune.app.ui.theme.SmartuneColors
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.gotrue.auth
import kotlinx.coroutines.launch

/**
 * Forgot Password screen matching Figma frame 129:799.
 * Shows a screen where the user can enter their email to receive a password reset link.
 */
@Composable
fun ForgotPasswordScreen(navController: NavHostController, supabaseClient: SupabaseClient) {
    var email by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }
    var errorMsg by remember { mutableStateOf<String?>(null) }
    var successMsg by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    colors = listOf(
                        Color(0xFF1A0033),
                        SmartuneColors.Background,
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
                .padding(top = 48.dp, bottom = 32.dp)
        ) {
            // ── Back arrow ──
            IconButton(
                onClick = { navController.popBackStack() },
                modifier = Modifier.size(40.dp)
            ) {
                Icon(
                    Icons.Default.ArrowBack,
                    contentDescription = "Volver",
                    tint = Color.White
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            // ── Icon ──
            Box(
                modifier = Modifier
                    .size(52.dp)
                    .background(
                        Brush.horizontalGradient(listOf(SmartuneColors.Primary, SmartuneColors.Accent)),
                        RoundedCornerShape(14.dp)
                    ),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    Icons.Default.Tune,
                    contentDescription = null,
                    tint = Color.White,
                    modifier = Modifier.size(28.dp)
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            // ── Title ──
            Text(
                "Recupera tu",
                color = Color.White,
                fontSize = 30.sp,
                fontWeight = FontWeight.Bold
            )
            Text(
                "Acceso",
                color = SmartuneColors.Primary,
                fontSize = 30.sp,
                fontWeight = FontWeight.ExtraBold
            )

            Spacer(modifier = Modifier.height(12.dp))

            Text(
                "Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.",
                color = SmartuneColors.TextSecondary,
                fontSize = 14.sp,
                lineHeight = 20.sp
            )

            Spacer(modifier = Modifier.height(32.dp))

            // ── Email field ──
            Text("Correo electrónico", color = Color.White, fontSize = 14.sp, fontWeight = FontWeight.Medium)
            Spacer(modifier = Modifier.height(8.dp))
            NeonTextField(
                value = email,
                onValueChange = { email = it },
                placeholder = "ejemplo@correo.com",
                leadingIcon = Icons.Default.Email,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(28.dp))

            // ── Messages ──
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

            // ── Send button ──
            NeonGradientButton(
                text = "Enviar Enlace",
                isLoading = isLoading,
                enabled = email.isNotBlank(),
                onClick = {
                    scope.launch {
                        isLoading = true
                        errorMsg = null
                        successMsg = null
                        try {
                            supabaseClient.auth.resetPasswordForEmail(email)
                            successMsg = "¡Enlace enviado! Revisa tu bandeja de entrada."
                        } catch (e: Exception) {
                            errorMsg = parseForgotError(e.message ?: "Error al enviar el enlace")
                        } finally {
                            isLoading = false
                        }
                    }
                }
            )

            Spacer(modifier = Modifier.height(24.dp))

            // ── Back to login ──
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    Icons.Default.Login,
                    contentDescription = null,
                    tint = SmartuneColors.TextSecondary,
                    modifier = Modifier.size(18.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    "Volver a Iniciar Sesión",
                    color = SmartuneColors.TextSecondary,
                    fontSize = 14.sp,
                    modifier = Modifier.clickable { navController.popBackStack() }
                )
            }
        }
    }
}

/**
 * Translates raw Supabase error messages into clean, user-friendly Spanish strings.
 */
private fun parseForgotError(raw: String): String {
    val lower = raw.lowercase()
    return when {
        "rate limit" in lower -> "Has superado el límite de intentos. Espera unos minutos e inténtalo de nuevo."
        "email" in lower && "valid" in lower -> "Ingresa un correo electrónico válido."
        "not found" in lower || "no user" in lower -> "No hay una cuenta con ese correo."
        "network" in lower || "connection" in lower -> "Error de conexión. Verifica tu internet."
        else -> {
            if (raw.length > 100) "Error al enviar el enlace. Inténtalo más tarde." else raw
        }
    }
}
