package com.smartune.app.iastudio

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.blur
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.AsyncImage
import com.smartune.app.core.theme.*

// ── Paleta Extendida Neon Nocturne ──────────────────────────────────────
private val BgStudio   = Color(0xFF0A0A0A)
private val CardBg     = Color(0xFF121212)
private val NeonPink   = Color(0xFFF6339A)
private val NeonCyan   = Color(0xFF00FFFF)
private val NeonPurp   = Color(0xFF9810FA)
private val TextW      = Color.White
private val TextMid    = Color.White.copy(alpha = 0.6f)
private val TextLow    = Color.White.copy(alpha = 0.3f)

@Composable
fun IAStudioScreen(viewModel: IAStudioViewModel = viewModel()) {
    val keyboardController = LocalSoftwareKeyboardController.current

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(BgStudio)
    ) {
        // ── Background Ambient Blobs ──
        Box(
            modifier = Modifier
                .size(400.dp)
                .offset(x = (-100).dp, y = (-100).dp)
                .blur(120.dp)
                .alpha(0.15f)
                .background(Brush.radialGradient(listOf(NeonCyan, Color.Transparent)), CircleShape)
        )
        Box(
            modifier = Modifier
                .size(350.dp)
                .align(Alignment.BottomEnd)
                .offset(x = 100.dp, y = 100.dp)
                .blur(100.dp)
                .alpha(0.12f)
                .background(Brush.radialGradient(listOf(NeonPurp, Color.Transparent)), CircleShape)
        )

        Column(modifier = Modifier.fillMaxSize()) {
            // ── Header ──
            StudioHeader(
                currentMode = viewModel.mode,
                onModeChange = { viewModel.mode = it }
            )

            // ── Main Content ──
            Box(modifier = Modifier.weight(1f).fillMaxWidth()) {
                AnimatedContent(
                    targetState = viewModel.mode,
                    transitionSpec = {
                        fadeIn() + slideInHorizontally { if (targetState == "chat") -1000 else 1000 } togetherWith
                        fadeOut() + slideOutHorizontally { if (targetState == "chat") 1000 else -1000 }
                    },
                    label = "ModeSwitch"
                ) { currentMode ->
                    if (currentMode == "chat") {
                        ChatInterface(viewModel)
                    } else {
                        GeneratorInterface(viewModel)
                    }
                }
            }
            
            // ── Bottom Input (Shared if needed or specific) ──
            // En el chat el input suele ir abajo. En el generador puede ir centrado o abajo.
            // Para Android lo pondremos flotante al final en el chat y centrado en el generador.
        }
        
        // ── Toast de Error ──
        viewModel.error?.let { err ->
            ErrorToast(message = err, onDismiss = { viewModel.error = null })
        }
    }
}

@Composable
fun StudioHeader(currentMode: String, onModeChange: (String) -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(top = 40.dp, bottom = 10.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 24.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
        ) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(Brush.linearGradient(listOf(NeonCyan, NeonPink)))
                    .padding(8.dp),
                contentAlignment = Alignment.Center
            ) {
                Icon(Icons.Default.AutoAwesome, null, tint = Color.Black, modifier = Modifier.size(20.dp))
            }
            Spacer(modifier = Modifier.width(12.dp))
            Column {
                Text(
                    "SmarTune Studio",
                    fontWeight = FontWeight.Black,
                    fontSize = 20.sp,
                    color = TextW,
                    letterSpacing = (-0.5).sp
                )
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(modifier = Modifier.size(6.dp).clip(CircleShape).background(NeonCyan))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("POWERED BY GEMINI", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = NeonCyan, letterSpacing = 2.sp)
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Mode Switcher (Glass)
        Row(
            modifier = Modifier
                .padding(horizontal = 24.dp)
                .clip(CircleShape)
                .background(Color.White.copy(alpha = 0.05f))
                .border(0.5.dp, Color.White.copy(alpha = 0.08f), CircleShape)
                .padding(4.dp)
        ) {
            ModeTab(
                label = "ASISTENTE",
                isSelected = currentMode == "chat",
                onClick = { onModeChange("chat") }
            )
            ModeTab(
                label = "COMPOSITOR",
                isSelected = currentMode == "generate",
                onClick = { onModeChange("generate") }
            )
        }
    }
}

@Composable
fun ModeTab(label: String, isSelected: Boolean, onClick: () -> Unit) {
    Box(
        modifier = Modifier
            .clip(CircleShape)
            .background(if (isSelected) Color.White.copy(alpha = 0.08f) else Color.Transparent)
            .clickable { onClick() }
            .padding(horizontal = 24.dp, vertical = 10.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            label,
            fontSize = 11.sp,
            fontWeight = FontWeight.Black,
            letterSpacing = 1.sp,
            color = if (isSelected) TextW else TextLow
        )
    }
}

@Composable
fun ChatInterface(viewModel: IAStudioViewModel) {
    val listState = rememberLazyListState()
    
    // Auto scroll to bottom
    LaunchedEffect(viewModel.chatHistory.size, viewModel.isGenerating) {
        if (viewModel.chatHistory.isNotEmpty()) {
            listState.animateScrollToItem(viewModel.chatHistory.size - 1)
        }
    }

    Column(modifier = Modifier.fillMaxSize()) {
        if (viewModel.chatHistory.isEmpty()) {
            Box(modifier = Modifier.weight(1f).fillMaxWidth(), contentAlignment = Alignment.Center) {
                Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.padding(32.dp)) {
                    Icon(Icons.Default.QuestionAnswer, null, modifier = Modifier.size(48.dp).alpha(0.2f), tint = TextW)
                    Spacer(modifier = Modifier.height(16.dp))
                    Text("Consulte cualquier duda sobre teoría,\nmezcla o estructura armónica.", textAlign = TextAlign.Center, color = TextMid, fontSize = 14.sp)
                }
            }
        } else {
            LazyColumn(
                state = listState,
                modifier = Modifier.weight(1f).fillMaxWidth(),
                contentPadding = PaddingValues(24.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                items(viewModel.chatHistory) { msg ->
                    val isUser = msg.first == "user"
                    ChatBubble(text = msg.second, isUser = isUser)
                }
                if (viewModel.isGenerating) {
                    item { LoadingBubble() }
                }
            }
        }

        // Chat Input Area
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(24.dp)
        ) {
            StudioInput(
                value = viewModel.prompt,
                onValueChange = { viewModel.prompt = it },
                onSend = { viewModel.handleAction() },
                isLoading = viewModel.isGenerating,
                placeholder = "Ingrese su consulta, señor..."
            )
        }
    }
}

@Composable
fun ChatBubble(text: String, isUser: Boolean) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = if (isUser) Arrangement.End else Arrangement.Start
    ) {
        if (!isUser) {
            Box(
                modifier = Modifier
                    .size(24.dp)
                    .clip(CircleShape)
                    .background(NeonCyan.copy(alpha = 0.1f))
                    .border(0.5.dp, NeonCyan.copy(alpha = 0.2f), CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(Icons.Default.AutoAwesome, null, tint = NeonCyan, modifier = Modifier.size(12.dp))
            }
            Spacer(modifier = Modifier.width(8.dp))
        }
        
        Box(
            modifier = Modifier
                .widthIn(max = 280.dp)
                .clip(RoundedCornerShape(20.dp).copy(
                    bottomEnd = if (isUser) CornerSize(2.dp) else CornerSize(20.dp),
                    bottomStart = if (!isUser) CornerSize(2.dp) else CornerSize(20.dp)
                ))
                .background(if (isUser) Color.White.copy(alpha = 0.08f) else CardBg)
                .border(0.5.dp, Color.White.copy(alpha = 0.1f), RoundedCornerShape(20.dp).copy(
                    bottomEnd = if (isUser) CornerSize(2.dp) else CornerSize(20.dp),
                    bottomStart = if (!isUser) CornerSize(2.dp) else CornerSize(20.dp)
                ))
                .padding(14.dp)
        ) {
            Text(text, color = TextW, fontSize = 14.sp, lineHeight = 20.sp)
        }
    }
}

@Composable
fun GeneratorInterface(viewModel: IAStudioViewModel) {
    Column(
        modifier = Modifier.fillMaxSize().padding(horizontal = 24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            "¿Qué obra maestra crearemos hoy?",
            fontWeight = FontWeight.Black,
            fontSize = 32.sp,
            textAlign = TextAlign.Center,
            color = TextW,
            lineHeight = 38.sp
        )
        
        Spacer(modifier = Modifier.height(32.dp))

        // Multi-line Input Box
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(32.dp))
                .background(CardBg)
                .border(1.dp, Color.White.copy(alpha = 0.1f), RoundedCornerShape(32.dp))
                .padding(20.dp)
        ) {
            Column {
                TextField(
                    value = viewModel.prompt,
                    onValueChange = { viewModel.prompt = it },
                    placeholder = { Text("Ej: Un beat Lo-fi relajante con piano eléctrico, a 85 BPM...", color = TextLow, fontSize = 15.sp) },
                    modifier = Modifier.fillMaxWidth().height(120.dp),
                    colors = TextFieldDefaults.colors(
                        focusedContainerColor = Color.Transparent,
                        unfocusedContainerColor = Color.Transparent,
                        focusedIndicatorColor = Color.Transparent,
                        unfocusedIndicatorColor = Color.Transparent,
                        cursorColor = NeonPink
                    )
                )
                
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("${viewModel.prompt.length} caracteres", fontSize = 10.sp, color = TextLow, fontWeight = FontWeight.Bold)
                    
                    Box(
                        modifier = Modifier
                            .size(56.dp)
                            .clip(CircleShape)
                            .background(if (viewModel.isGenerating || viewModel.prompt.isBlank()) Color.White.copy(alpha = 0.1f) else Color.White)
                            .clickable(enabled = !viewModel.isGenerating && viewModel.prompt.isNotBlank()) { viewModel.handleAction() },
                        contentAlignment = Alignment.Center
                    ) {
                        if (viewModel.isGenerating) {
                            CircularProgressIndicator(modifier = Modifier.size(24.dp), color = Color.Black, strokeWidth = 2.dp)
                        } else {
                            Icon(Icons.Default.AutoAwesome, null, tint = Color.Black)
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(40.dp))

        // Result Card
        AnimatedVisibility(
            visible = viewModel.result != null,
            enter = expandVertically() + fadeIn(),
            exit = shrinkVertically() + fadeOut()
        ) {
            viewModel.result?.let { track ->
                MusicResultCard(track)
            }
        }
    }
}

@Composable
fun MusicResultCard(track: MusicResponse) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(32.dp))
            .background(Brush.linearGradient(listOf(CardBg, Color.Black)))
            .border(1.dp, Color.White.copy(alpha = 0.05f), RoundedCornerShape(32.dp))
            .padding(20.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            AsyncImage(
                model = track.coverUrl,
                contentDescription = null,
                modifier = Modifier
                    .size(100.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .background(Color.White.copy(alpha = 0.05f)),
                contentScale = ContentScale.Crop
            )
            
            Spacer(modifier = Modifier.width(20.dp))
            
            Column {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(4.dp))
                            .background(NeonCyan.copy(alpha = 0.1f))
                            .padding(horizontal = 6.dp, vertical = 2.dp)
                    ) {
                        Text("GENERADO", fontSize = 8.sp, fontWeight = FontWeight.Black, color = NeonCyan)
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("${track.bpm} BPM • ${track.mood}", fontSize = 10.sp, color = TextLow)
                }
                
                Spacer(modifier = Modifier.height(6.dp))
                
                Text(
                    track.title ?: "Untitled",
                    fontWeight = FontWeight.Black,
                    fontSize = 20.sp,
                    color = TextW,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Text(
                    track.artist ?: "SmarTune AI",
                    fontSize = 14.sp,
                    color = TextMid
                )
                
                Spacer(modifier = Modifier.height(14.dp))
                
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    IconButton(
                        onClick = { /* Save/Like logic */ },
                        modifier = Modifier.size(36.dp).background(Color.White.copy(alpha = 0.05f), CircleShape)
                    ) {
                        Icon(Icons.Default.FavoriteBorder, null, tint = TextMid, modifier = Modifier.size(18.dp))
                    }
                    
                    // Simple play visual
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .height(36.dp)
                            .clip(CircleShape)
                            .background(Color.White.copy(alpha = 0.05f))
                            .padding(horizontal = 12.dp),
                        contentAlignment = Alignment.CenterStart
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.PlayArrow, null, tint = TextW, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Box(modifier = Modifier.fillMaxWidth().height(2.dp).background(TextLow))
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun StudioInput(
    value: String,
    onValueChange: (String) -> Unit,
    onSend: () -> Unit,
    isLoading: Boolean,
    placeholder: String
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(CircleShape)
            .background(CardBg)
            .border(1.dp, Color.White.copy(alpha = 0.08f), CircleShape)
            .padding(horizontal = 8.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        TextField(
            value = value,
            onValueChange = onValueChange,
            placeholder = { Text(placeholder, color = TextLow, fontSize = 14.sp) },
            modifier = Modifier.weight(1f),
            colors = TextFieldDefaults.colors(
                focusedContainerColor = Color.Transparent,
                unfocusedContainerColor = Color.Transparent,
                focusedIndicatorColor = Color.Transparent,
                unfocusedIndicatorColor = Color.Transparent,
                cursorColor = NeonPink
            ),
            singleLine = true,
            keyboardOptions = KeyboardOptions(imeAction = ImeAction.Send),
            keyboardActions = KeyboardActions(onSend = { onSend() })
        )
        
        Box(
            modifier = Modifier
                .size(44.dp)
                .clip(CircleShape)
                .background(if (isLoading || value.isBlank()) Color.Transparent else Color.White)
                .clickable(enabled = !isLoading && value.isNotBlank()) { onSend() },
            contentAlignment = Alignment.Center
        ) {
            if (isLoading) {
                CircularProgressIndicator(modifier = Modifier.size(20.dp), color = NeonPink, strokeWidth = 2.dp)
            } else {
                Icon(
                    Icons.Default.Send,
                    null,
                    tint = if (value.isBlank()) TextLow else Color.Black,
                    modifier = Modifier.size(20.dp)
                )
            }
        }
    }
}

@Composable
fun LoadingBubble() {
    Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(start = 32.dp)) {
        Box(modifier = Modifier.size(6.dp).clip(CircleShape).background(NeonCyan))
        Spacer(modifier = Modifier.width(4.dp))
        Box(modifier = Modifier.size(6.dp).clip(CircleShape).background(NeonPink))
        Spacer(modifier = Modifier.width(4.dp))
        Box(modifier = Modifier.size(6.dp).clip(CircleShape).background(NeonPurp))
    }
}

@Composable
fun ErrorToast(message: String, onDismiss: () -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        contentAlignment = Alignment.BottomCenter
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(16.dp))
                .background(Color(0xFF2A050A))
                .border(1.dp, Color.Red.copy(alpha = 0.2f), RoundedCornerShape(16.dp))
                .clickable { onDismiss() }
                .padding(16.dp)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.ErrorOutline, null, tint = Color.Red, modifier = Modifier.size(20.dp))
                Spacer(modifier = Modifier.width(12.dp))
                Text(message, color = Color.Red.copy(alpha = 0.8f), fontSize = 12.sp, modifier = Modifier.weight(1f))
                Icon(Icons.Default.Close, null, tint = Color.Red.copy(alpha = 0.3f), modifier = Modifier.size(16.dp))
            }
        }
    }
}

// Helper para esquinas redondeadas
private fun CornerSize(size: androidx.compose.ui.unit.Dp) = androidx.compose.foundation.shape.CornerSize(size)
