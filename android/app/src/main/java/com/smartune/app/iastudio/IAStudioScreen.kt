package com.smartune.app.iastudio

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Send
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.blur
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun IAStudioScreen() {
    val bgColor = Color(0xFF0F0F0F)
    val cardBg = Color(0xFF1A1A1A)
    val brandPurple = Color(0xFFD000FF)
    
    var mode by remember { mutableStateOf("generate") }
    var prompt by remember { mutableStateOf("") }
    var isGenerating by remember { mutableStateOf(false) }
    
    // Fake states for chat
    val chatHistory = remember { mutableStateListOf<Pair<String, String>>() }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(bgColor)
    ) {
        // Gradient Ambient Top
        Box(
            modifier = Modifier
                .align(Alignment.TopCenter)
                .fillMaxWidth()
                .height(300.dp)
                .blur(120.dp)
                .background(
                    Brush.verticalGradient(
                        colors = listOf(brandPurple.copy(alpha = 0.2f), Color.Transparent)
                    )
                )
        )
        
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.height(32.dp))
            
            Text(
                text = "IA STUDIO",
                style = MaterialTheme.typography.headlineLarge.copy(
                    fontWeight = FontWeight.Black,
                    fontSize = 48.sp,
                    color = Color.White
                )
            )
            Text(
                text = "Crea música o consulta con tu productor IA",
                color = Color.Gray,
                fontSize = 14.sp
            )
            
            Spacer(modifier = Modifier.height(32.dp))
            
            // Tabs
            Row(
                modifier = Modifier
                    .clip(RoundedCornerShape(16.dp))
                    .background(cardBg)
                    .border(1.dp, Color.White.copy(alpha = 0.1f), RoundedCornerShape(16.dp))
                    .padding(8.dp),
                horizontalArrangement = Arrangement.Center
            ) {
                TabButton(
                    text = "\uD83E\uDE84 Crear Música",
                    isSelected = mode == "generate",
                    brandPurple = brandPurple,
                    onClick = { mode = "generate" }
                )
                Spacer(modifier = Modifier.width(8.dp))
                TabButton(
                    text = "\uD83D\uDCAC Consultar IA",
                    isSelected = mode == "chat",
                    brandPurple = brandPurple,
                    onClick = { mode = "chat" }
                )
            }
            
            Spacer(modifier = Modifier.height(32.dp))
            
            // Main Content Area
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
                    .clip(RoundedCornerShape(32.dp))
                    .background(cardBg)
                    .border(1.dp, Color.White.copy(alpha = 0.1f), RoundedCornerShape(32.dp))
                    .padding(24.dp)
            ) {
                if (mode == "chat") {
                    ChatModeView(
                        chatHistory = chatHistory,
                        brandPurple = brandPurple,
                        prompt = prompt,
                        onPromptChange = { prompt = it },
                        onSend = {
                            if (prompt.isNotBlank()) {
                                chatHistory.add(Pair("user", prompt))
                                // Simulate ai delay
                                chatHistory.add(Pair("ai", "SmarTune IA procesando tu solicitud sobre producción musical..."))
                                prompt = ""
                            }
                        }
                    )
                } else {
                    GenerateModeView(
                        brandPurple = brandPurple,
                        prompt = prompt,
                        onPromptChange = { prompt = it },
                        isGenerating = isGenerating,
                        onGenerate = { isGenerating = !isGenerating }
                    )
                }
            }
            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}

@Composable
fun TabButton(text: String, isSelected: Boolean, brandPurple: Color, onClick: () -> Unit) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(12.dp))
            .background(if (isSelected) brandPurple else Color.Transparent)
            .clickable { onClick() }
            .padding(horizontal = 24.dp, vertical = 12.dp)
    ) {
        Text(
            text = text,
            color = if (isSelected) Color.White else Color.Gray,
            fontWeight = FontWeight.Bold,
            fontSize = 14.sp
        )
    }
}

@Composable
fun ChatModeView(
    chatHistory: List<Pair<String, String>>,
    brandPurple: Color,
    prompt: String,
    onPromptChange: (String) -> Unit,
    onSend: () -> Unit
) {
    Column(modifier = Modifier.fillMaxSize()) {
        if (chatHistory.isEmpty()) {
            Box(
                modifier = Modifier.weight(1f).fillMaxWidth(),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("💬", fontSize = 48.sp, modifier = Modifier.alpha(0.4f))
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        "Pregúntame lo que quieras sobre\nproducción musical o teoría.",
                        color = Color.White.copy(alpha = 0.4f),
                        textAlign = TextAlign.Center
                    )
                }
            }
        } else {
            LazyColumn(modifier = Modifier.weight(1f)) {
                items(chatHistory) { msg ->
                    val isUser = msg.first == "user"
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp),
                        contentAlignment = if (isUser) Alignment.CenterEnd else Alignment.CenterStart
                    ) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth(0.8f)
                                .clip(RoundedCornerShape(16.dp))
                                .background(if (isUser) brandPurple.copy(alpha = 0.2f) else Color.White.copy(alpha = 0.05f))
                                .border(
                                    1.dp,
                                    if (isUser) brandPurple.copy(alpha = 0.3f) else Color.White.copy(alpha = 0.1f),
                                    RoundedCornerShape(16.dp)
                                )
                                .padding(16.dp)
                        ) {
                            Text(msg.second, color = Color.White, fontSize = 14.sp)
                        }
                    }
                }
            }
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        OutlinedTextField(
            value = prompt,
            onValueChange = onPromptChange,
            placeholder = { Text("Escribe tu duda aquí...", color = Color.Gray) },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedContainerColor = Color.Black.copy(alpha = 0.4f),
                unfocusedContainerColor = Color.Black.copy(alpha = 0.4f),
                focusedBorderColor = brandPurple,
                unfocusedBorderColor = Color.White.copy(alpha = 0.1f),
            ),
            trailingIcon = {
                IconButton(onClick = onSend) {
                    Icon(Icons.Default.Send, contentDescription = "Send", tint = brandPurple)
                }
            }
        )
    }
}

@Composable
fun GenerateModeView(
    brandPurple: Color,
    prompt: String,
    onPromptChange: (String) -> Unit,
    isGenerating: Boolean,
    onGenerate: () -> Unit
) {
    Column(modifier = Modifier.fillMaxSize()) {
        Text(
            text = "DESCRIBE TU VISIÓN MUSICAL",
            color = Color.White.copy(alpha = 0.4f),
            fontSize = 10.sp,
            fontWeight = FontWeight.Black,
            letterSpacing = 2.sp
        )
        Spacer(modifier = Modifier.height(8.dp))
        
        val colors = OutlinedTextFieldDefaults.colors(
                focusedContainerColor = Color.Black.copy(alpha = 0.4f),
                unfocusedContainerColor = Color.Black.copy(alpha = 0.4f),
                focusedBorderColor = brandPurple,
                unfocusedBorderColor = Color.White.copy(alpha = 0.1f),
        )
        TextField(
            value = prompt,
            onValueChange = onPromptChange,
            placeholder = { Text("Ej: Un track de K-pop energético o un Jazz suave...", color = Color.Gray) },
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f)
                .clip(RoundedCornerShape(24.dp))
                .border(1.dp, Color.White.copy(alpha = 0.1f), RoundedCornerShape(24.dp)),
            colors = colors,
            shape = RoundedCornerShape(24.dp)
        )
        
        Spacer(modifier = Modifier.height(24.dp))
        
        Button(
            onClick = onGenerate,
            modifier = Modifier.fillMaxWidth().height(60.dp),
            shape = RoundedCornerShape(16.dp),
            colors = ButtonDefaults.buttonColors(containerColor = brandPurple)
        ) {
            Text(
                text = if (isGenerating) "GENERANDO..." else "GENERAR TRACK",
                fontWeight = FontWeight.Black,
                letterSpacing = 2.sp,
                fontSize = 16.sp
            )
        }
    }
}
