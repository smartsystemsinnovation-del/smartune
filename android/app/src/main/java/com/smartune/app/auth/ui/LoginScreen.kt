package com.smartune.app.auth.ui

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material.icons.outlined.Email
import androidx.compose.material.icons.outlined.GraphicEq
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.smartune.app.auth.viewmodel.AuthUiState
import com.smartune.app.auth.viewmodel.AuthViewModel
import com.smartune.app.core.theme.*

enum class AuthViewState { LOGIN, REGISTER, RECOVERY, UPDATE_PASSWORD }

@Composable
fun LoginScreen(
    onLoginSuccess: () -> Unit,
    startWithRecovery: Boolean = false,
    authViewModel: AuthViewModel = viewModel()
) {
    val uiState by authViewModel.uiState.collectAsStateWithLifecycle()
    var currentView by remember { mutableStateOf(AuthViewState.REGISTER) }

    LaunchedEffect(startWithRecovery) {
        if (startWithRecovery) {
            authViewModel.setUpdateMode(true)
        }
    }

    LaunchedEffect(uiState.success) {
        if (uiState.success && currentView != AuthViewState.RECOVERY && currentView != AuthViewState.UPDATE_PASSWORD) onLoginSuccess()
    }

    LaunchedEffect(uiState.isUpdateMode) {
        if (uiState.isUpdateMode) currentView = AuthViewState.UPDATE_PASSWORD
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(BgMain)
    ) {
        // Decorative Blurs
        Box(
            modifier = Modifier
                .align(Alignment.BottomStart)
                .offset(x = (-96).dp, y = 96.dp)
                .size(256.dp)
                .background(NeonPink.copy(alpha = 0.1f), RoundedCornerShape(100))
        )
        Box(
            modifier = Modifier
                .align(Alignment.TopEnd)
                .offset(x = 96.dp, y = (-96).dp)
                .size(256.dp)
                .background(NeonPurple.copy(alpha = 0.1f), RoundedCornerShape(100))
        )

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp)
                .systemBarsPadding()
        ) {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                if (currentView == AuthViewState.RECOVERY) {
                    IconButton(onClick = { currentView = AuthViewState.LOGIN }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = TextPrimary)
                    }
                } else {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.Center,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(24.dp)
                                .clip(RoundedCornerShape(6.dp))
                                .background(NeonPink),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Outlined.GraphicEq, contentDescription = null, tint = TextPrimary, modifier = Modifier.size(16.dp))
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "SmarTune",
                            color = TextPrimary,
                            fontWeight = FontWeight.Bold,
                            fontSize = 18.sp
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            AnimatedContent(
                targetState = currentView,
                transitionSpec = {
                    fadeIn() togetherWith fadeOut()
                },
                label = "AuthViewTransition"
            ) { state ->
                when (state) {
                    AuthViewState.REGISTER -> RegisterView(
                        authViewModel = authViewModel,
                        onNavigateLogin = { currentView = AuthViewState.LOGIN },
                        uiState = uiState
                    )
                    AuthViewState.LOGIN -> LoginView(
                        authViewModel = authViewModel,
                        onNavigateRegister = { currentView = AuthViewState.REGISTER },
                        onNavigateRecovery = { currentView = AuthViewState.RECOVERY },
                        uiState = uiState
                    )
                    AuthViewState.RECOVERY -> RecoveryView(
                        authViewModel = authViewModel,
                        onNavigateLogin = { currentView = AuthViewState.LOGIN },
                        uiState = uiState
                    )
                    AuthViewState.UPDATE_PASSWORD -> UpdatePasswordView(
                        authViewModel = authViewModel,
                        onNavigateLogin = { currentView = AuthViewState.LOGIN },
                        uiState = uiState
                    )
                }
            }

            uiState.error?.let { error ->
                Card(
                    modifier = Modifier.fillMaxWidth().padding(top = 16.dp)
                        .clickable { authViewModel.clearError() },
                    colors = CardDefaults.cardColors(containerColor = NeonRed.copy(alpha = 0.15f)),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text(text = error, color = NeonRed, modifier = Modifier.padding(16.dp).fillMaxWidth(), textAlign = TextAlign.Center, fontSize = 13.sp)
                }
            }

            uiState.message?.let { msg ->
                Card(
                    modifier = Modifier.fillMaxWidth().padding(top = 16.dp)
                        .clickable { authViewModel.clearError() },
                    colors = CardDefaults.cardColors(containerColor = NeonGreen.copy(alpha = 0.15f)),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text(text = msg, color = NeonGreen, modifier = Modifier.padding(16.dp).fillMaxWidth(), textAlign = TextAlign.Center, fontSize = 13.sp)
                }
            }
        }
    }
}

@Composable
fun UpdatePasswordView(
    authViewModel: AuthViewModel,
    onNavigateLogin: () -> Unit,
    uiState: AuthUiState
) {
    var password by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }
    var showPassword by remember { mutableStateOf(false) }

    Column(modifier = Modifier.fillMaxWidth()) {
        Text(
            text = buildAnnotatedString {
                append("Nueva\n")
                withStyle(SpanStyle(color = NeonPink)) { append("Contraseña") }
            },
            fontSize = 36.sp,
            fontWeight = FontWeight.Bold,
            lineHeight = 42.sp,
            color = TextPrimary
        )
        Text(
            text = "Establece una contraseña segura para tu cuenta.",
            color = TextSecondary,
            fontSize = 14.sp,
            modifier = Modifier.padding(top = 12.dp, bottom = 32.dp)
        )

        CustomTextField(
            label = "Contraseña",
            placeholder = "Mínimo 8 caracteres",
            value = password,
            onValueChange = { password = it },
            keyboardType = KeyboardType.Password,
            isPassword = true,
            showPassword = showPassword,
            onTogglePassword = { showPassword = !showPassword }
        )
        Spacer(modifier = Modifier.height(16.dp))
        CustomTextField(
            label = "Confirmar Contraseña",
            placeholder = "Repite la contraseña",
            value = confirmPassword,
            onValueChange = { confirmPassword = it },
            keyboardType = KeyboardType.Password,
            isPassword = true,
            showPassword = showPassword,
            onTogglePassword = { showPassword = !showPassword }
        )

        Spacer(modifier = Modifier.height(32.dp))

        Button(
            onClick = { authViewModel.updateUserPassword(password) },
            enabled = password.length >= 8 && password == confirmPassword && !uiState.isLoading,
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp),
            shape = RoundedCornerShape(12.dp),
            colors = ButtonDefaults.buttonColors(containerColor = NeonPink)
        ) {
            if (uiState.isLoading) {
                CircularProgressIndicator(color = TextPrimary, modifier = Modifier.size(24.dp))
            } else {
                Text("Actualizar Contraseña", fontWeight = FontWeight.Bold, fontSize = 16.sp)
            }
        }

        if (password != confirmPassword && confirmPassword.isNotEmpty()) {
            Text(
                "Las contraseñas no coinciden",
                color = NeonRed,
                fontSize = 12.sp,
                modifier = Modifier.padding(top = 8.dp)
            )
        }
    }
}

@Composable
fun RegisterView(
    authViewModel: AuthViewModel,
    onNavigateLogin: () -> Unit,
    uiState: AuthUiState
) {
    var username by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var showPassword by remember { mutableStateOf(false) }

    Column(modifier = Modifier.fillMaxWidth()) {
        Text(
            text = buildAnnotatedString {
                append("Crea tu ")
                withStyle(SpanStyle(color = NeonPink)) { append("Cuenta") }
            },
            fontSize = 36.sp,
            fontWeight = FontWeight.Bold,
            color = TextPrimary
        )
        Text(
            text = "Únete a la revolución musical inteligente.",
            color = TextSecondary,
            fontSize = 14.sp,
            modifier = Modifier.padding(top = 8.dp, bottom = 32.dp)
        )

        CustomTextField(
            label = "Username",
            placeholder = "Elige un nombre de usuario",
            value = username,
            onValueChange = { username = it }
        )
        Spacer(modifier = Modifier.height(16.dp))

        CustomTextField(
            label = "Email",
            placeholder = "tu@email.com",
            value = email,
            onValueChange = { email = it },
            keyboardType = KeyboardType.Email
        )
        Spacer(modifier = Modifier.height(16.dp))

        CustomTextField(
            label = "Password",
            placeholder = "Mínimo 8 caracteres",
            value = password,
            onValueChange = { password = it },
            keyboardType = KeyboardType.Password,
            isPassword = true,
            showPassword = showPassword,
            onTogglePassword = { showPassword = !showPassword }
        )

        Spacer(modifier = Modifier.height(32.dp))

        Button(
            onClick = { authViewModel.registerWithEmail(email, password, username) },
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp),
            shape = RoundedCornerShape(12.dp),
            colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent),
            contentPadding = PaddingValues()
        ) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(
                        brush = Brush.horizontalGradient(listOf(NeonPink, NeonPurple)),
                        shape = RoundedCornerShape(12.dp)
                    ),
                contentAlignment = Alignment.Center
            ) {
                if (uiState.isLoading) {
                    CircularProgressIndicator(color = TextPrimary, modifier = Modifier.size(24.dp))
                } else {
                    Text("Regístrate", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = TextPrimary)
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))
        DividerWithText()
        Spacer(modifier = Modifier.height(24.dp))

        GoogleButton(onClick = { authViewModel.loginWithGoogle() })

        Spacer(modifier = Modifier.weight(1f))

        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.Center) {
            Text("¿Ya tienes cuenta? ", color = TextSecondary, fontSize = 14.sp)
            Text(
                "Inicia Sesión",
                color = NeonBlue,
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.clickable { onNavigateLogin() }
            )
        }
    }
}

@Composable
fun LoginView(
    authViewModel: AuthViewModel,
    onNavigateRegister: () -> Unit,
    onNavigateRecovery: () -> Unit,
    uiState: AuthUiState
) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var showPassword by remember { mutableStateOf(false) }
    
    val context = androidx.compose.ui.platform.LocalContext.current

    Column(modifier = Modifier.fillMaxWidth()) {
        Text(
            text = buildAnnotatedString {
                append("Bienvenido de\n")
                withStyle(SpanStyle(color = NeonPink)) { append("Vuelta") }
            },
            fontSize = 36.sp,
            fontWeight = FontWeight.Bold,
            color = TextPrimary,
            lineHeight = 42.sp,
            modifier = Modifier.padding(bottom = 32.dp)
        )

        CustomTextField(
            label = "Email",
            placeholder = "nombre@ejemplo.com",
            value = email,
            onValueChange = { email = it },
            keyboardType = KeyboardType.Email
        )
        Spacer(modifier = Modifier.height(16.dp))

        CustomTextField(
            label = "Contraseña",
            placeholder = "********",
            value = password,
            onValueChange = { password = it },
            keyboardType = KeyboardType.Password,
            isPassword = true,
            showPassword = showPassword,
            onTogglePassword = { showPassword = !showPassword }
        )

        Text(
            text = "¿Olvidaste tu contraseña?",
            color = NeonPink,
            fontSize = 13.sp,
            fontWeight = FontWeight.SemiBold,
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 12.dp, bottom = 24.dp)
                .clickable { onNavigateRecovery() },
            textAlign = TextAlign.End
        )

        Button(
            onClick = { authViewModel.loginWithEmail(email, password) },
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp),
            shape = RoundedCornerShape(12.dp),
            colors = ButtonDefaults.buttonColors(containerColor = NeonPink)
        ) {
            if (uiState.isLoading) {
                CircularProgressIndicator(color = TextPrimary, modifier = Modifier.size(24.dp))
            } else {
                Text("Inicia Sesión", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = TextPrimary)
            }
        }

        Spacer(modifier = Modifier.height(24.dp))
        DividerWithText()
        Spacer(modifier = Modifier.height(24.dp))

        GoogleButton(onClick = { 
            val url = "https://mpsmvszyzrtxwadmjuei.supabase.co/auth/v1/authorize?provider=google&redirect_to=smartune-auth://callback"
            val intent = android.content.Intent(android.content.Intent.ACTION_VIEW, android.net.Uri.parse(url))
            context.startActivity(intent)
        })

        Spacer(modifier = Modifier.weight(1f))

        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.Center) {
            Text("¿No tienes cuenta? ", color = TextSecondary, fontSize = 14.sp)
            Text(
                "Regístrate",
                color = NeonBlue,
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.clickable { onNavigateRegister() }
            )
        }
    }
}

@Composable
fun RecoveryView(
    authViewModel: AuthViewModel,
    onNavigateLogin: () -> Unit,
    uiState: AuthUiState
) {
    var email by remember { mutableStateOf("") }

    Column(modifier = Modifier.fillMaxWidth()) {
        Box(
            modifier = Modifier
                .size(48.dp)
                .clip(RoundedCornerShape(12.dp))
                .background(NeonPink)
                .padding(bottom = 16.dp), // Adjust margins to match design
            contentAlignment = Alignment.Center
        ) {
            Icon(Icons.Outlined.GraphicEq, contentDescription = null, tint = TextPrimary)
        }
        
        Spacer(modifier = Modifier.height(24.dp))

        Text(
            text = buildAnnotatedString {
                append("Recupera tu\n")
                withStyle(SpanStyle(color = NeonPink)) { append("Acceso") }
            },
            fontSize = 36.sp,
            fontWeight = FontWeight.Bold,
            lineHeight = 42.sp,
            color = TextPrimary
        )
        Text(
            text = "Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.",
            color = TextSecondary,
            fontSize = 14.sp,
            modifier = Modifier.padding(top = 12.dp, bottom = 32.dp)
        )

        Text("Correo electrónico", color = TextTertiary, fontSize = 14.sp, fontWeight = FontWeight.Medium)
        Spacer(modifier = Modifier.height(8.dp))
        OutlinedTextField(
            value = email,
            onValueChange = { email = it },
            placeholder = { Text("ejemplo@correo.com", color = TextTertiary) },
            leadingIcon = { Icon(Icons.Outlined.Email, contentDescription = null, tint = TextTertiary) },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = NeonPink.copy(alpha=0.5f),
                unfocusedBorderColor = NeonPink.copy(alpha=0.2f),
                focusedTextColor = TextPrimary,
                unfocusedTextColor = TextPrimary,
                focusedContainerColor = BgCard.copy(alpha=0.5f),
                unfocusedContainerColor = BgCard.copy(alpha=0.5f)
            ),
            singleLine = true
        )

        Spacer(modifier = Modifier.height(32.dp))

        Button(
            onClick = { authViewModel.resetPassword(email) },
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp),
            shape = RoundedCornerShape(12.dp),
            colors = ButtonDefaults.buttonColors(containerColor = NeonPurple) // Replicating the purple button
        ) {
            if (uiState.isLoading) {
                CircularProgressIndicator(color = TextPrimary, modifier = Modifier.size(24.dp))
            } else {
                Text("Enviar Enlace", fontWeight = FontWeight.Bold, fontSize = 16.sp)
            }
        }

        Spacer(modifier = Modifier.height(32.dp))
        
        Row(
            modifier = Modifier.fillMaxWidth().clickable { onNavigateLogin() },
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null, tint = TextSecondary, modifier = Modifier.size(16.dp))
            Spacer(modifier = Modifier.width(8.dp))
            Text("Volver a Iniciar Sesión", color = TextSecondary, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
        }
    }
}

@Composable
fun CustomTextField(
    label: String,
    placeholder: String,
    value: String,
    onValueChange: (String) -> Unit,
    keyboardType: KeyboardType = KeyboardType.Text,
    isPassword: Boolean = false,
    showPassword: Boolean = false,
    onTogglePassword: () -> Unit = {}
) {
    Column {
        Text(label, color = TextTertiary, fontSize = 14.sp, fontWeight = FontWeight.Medium)
        Spacer(modifier = Modifier.height(8.dp))
        OutlinedTextField(
            value = value,
            onValueChange = onValueChange,
            placeholder = { Text(placeholder, color = TextTertiary) },
            modifier = Modifier.fillMaxWidth().height(56.dp),
            shape = RoundedCornerShape(12.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = NeonPink.copy(alpha = 0.5f),
                unfocusedBorderColor = NeonPink.copy(alpha = 0.2f),
                focusedTextColor = TextPrimary,
                unfocusedTextColor = TextPrimary,
                cursorColor = NeonPink,
                focusedContainerColor = BgCard.copy(alpha = 0.5f),
                unfocusedContainerColor = BgCard.copy(alpha = 0.5f),
            ),
            keyboardOptions = KeyboardOptions(keyboardType = keyboardType, imeAction = ImeAction.Next),
            visualTransformation = if (isPassword && !showPassword) PasswordVisualTransformation() else VisualTransformation.None,
            trailingIcon = if (isPassword) {
                {
                    IconButton(onClick = onTogglePassword) {
                        Icon(
                            if (showPassword) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                            contentDescription = null,
                            tint = TextTertiary
                        )
                    }
                }
            } else null,
            singleLine = true
        )
    }
}

@Composable
fun DividerWithText() {
    Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
        HorizontalDivider(modifier = Modifier.weight(1f), color = BgCard, thickness = 1.dp)
        Text(" O ", color = TextTertiary, fontSize = 12.sp, modifier = Modifier.padding(horizontal = 16.dp))
        HorizontalDivider(modifier = Modifier.weight(1f), color = BgCard, thickness = 1.dp)
    }
}

@Composable
fun GoogleButton(onClick: () -> Unit) {
    Button(
        onClick = onClick,
        modifier = Modifier
            .fillMaxWidth()
            .height(56.dp),
        shape = RoundedCornerShape(12.dp),
        colors = ButtonDefaults.buttonColors(containerColor = Color.White)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.Center) {
            // Simulated minimal Google "G" representation:
            Text("G", color = Color(0xFF4285F4), fontWeight = FontWeight.Bold) // A very crude placeholder for the actual Google Logo
            Spacer(modifier = Modifier.width(12.dp))
            Text("Continuar con Google", color = Color.Black, fontWeight = FontWeight.Bold, fontSize = 16.sp)
        }
    }
}
