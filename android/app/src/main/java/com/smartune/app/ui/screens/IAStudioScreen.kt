package com.smartune.app.ui.screens

import androidx.compose.animation.core.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
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
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.smartune.app.ui.theme.SmartuneColors
import io.github.jan.supabase.gotrue.auth
import io.github.jan.supabase.postgrest.postgrest
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.engine.android.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.coroutines.launch
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.*

@Serializable
data class GeminiContent(val parts: List<GeminiPart>)
@Serializable
data class GeminiPart(val text: String)
@Serializable
data class GeminiCandidate(val content: GeminiContent)
@Serializable
data class GeminiResponse(val candidates: List<GeminiCandidate>? = null)

data class ChatMessage(val role: String, val text: String) // "user" or "ai"
data class GeneratedTrack(val title: String, val artist: String, val mood: String, val bpm: Int)

private const val GEMINI_API_KEY = "AIzaSyAZdUt8OvDUkVzF5G_Q4oF6E8CkFe6-6K4"

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun IAStudioScreen() {
    var mode by remember { mutableStateOf("generate") }
    var prompt by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }
    var generatedTrack by remember { mutableStateOf<GeneratedTrack?>(null) }
    var chatHistory by remember { mutableStateOf(listOf<ChatMessage>()) }
    var error by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    val httpClient = remember {
        HttpClient(Android) {
            install(ContentNegotiation) { json(Json { ignoreUnknownKeys = true }) }
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(SmartuneColors.Background)
            .padding(horizontal = 24.dp)
    ) {
        Spacer(modifier = Modifier.height(16.dp))
        Text("IA", color = Color.White, fontSize = 40.sp, fontWeight = FontWeight.ExtraBold, modifier = Modifier.padding(0.dp))
        Text("STUDIO", color = SmartuneColors.Primary, fontSize = 40.sp, fontWeight = FontWeight.ExtraBold)
        Text("Crea música o consulta con tu productor IA", color = Color.Gray, fontSize = 13.sp)

        Spacer(modifier = Modifier.height(16.dp))

        // Mode Tabs
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(SmartuneColors.Surface, RoundedCornerShape(16.dp))
                .border(0.5.dp, SmartuneColors.Border, RoundedCornerShape(16.dp))
                .padding(4.dp),
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            listOf("generate" to "🪄 Crear", "chat" to "💬 Chat").forEach { (m, label) ->
                Button(
                    onClick = { mode = m; error = null },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (mode == m) SmartuneColors.Primary else Color.Transparent
                    ),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.weight(1f).padding(horizontal = 4.dp)
                ) {
                    Text(label, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Content Area
        if (mode == "chat") {
            // Chat Mode
            LazyColumn(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(12.dp),
                reverseLayout = false
            ) {
                if (chatHistory.isEmpty()) {
                    item {
                        Box(modifier = Modifier.fillMaxWidth().padding(top = 60.dp), contentAlignment = Alignment.Center) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text("💬", fontSize = 48.sp)
                                Spacer(modifier = Modifier.height(8.dp))
                                Text("Pregúntame lo que quieras", color = Color.Gray, fontSize = 14.sp)
                                Text("sobre producción musical", color = Color.Gray, fontSize = 14.sp)
                            }
                        }
                    }
                }
                items(chatHistory) { msg ->
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = if (msg.role == "user") Arrangement.End else Arrangement.Start
                    ) {
                        Card(
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(
                                containerColor = if (msg.role == "user") SmartuneColors.Primary.copy(alpha = 0.2f) else SmartuneColors.GlassCard
                            ),
                            modifier = Modifier
                                .widthIn(max = 280.dp)
                                .border(
                                    0.5.dp,
                                    if (msg.role == "user") SmartuneColors.Primary.copy(alpha = 0.3f) else SmartuneColors.Border,
                                    RoundedCornerShape(16.dp)
                                )
                        ) {
                            Text(
                                msg.text,
                                color = if (msg.role == "user") Color.White else Color.LightGray,
                                fontSize = 13.sp,
                                modifier = Modifier.padding(12.dp)
                            )
                        }
                    }
                }
                if (isLoading) {
                    item {
                        Row {
                            Card(
                                shape = RoundedCornerShape(16.dp),
                                colors = CardDefaults.cardColors(containerColor = SmartuneColors.GlassCard)
                            ) {
                                Text("...", color = Color.Gray, modifier = Modifier.padding(12.dp), fontSize = 18.sp)
                            }
                        }
                    }
                }
            }

            // Chat Input
            Row(
                modifier = Modifier.padding(vertical = 12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                OutlinedTextField(
                    value = prompt,
                    onValueChange = { prompt = it },
                    placeholder = { Text("Escribe tu duda...", color = Color.Gray) },
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = SmartuneColors.Primary,
                        unfocusedBorderColor = SmartuneColors.Border,
                        focusedTextColor = Color.White, unfocusedTextColor = Color.White
                    ),
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(16.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                FloatingActionButton(
                    onClick = {
                        if (prompt.isBlank() || isLoading) return@FloatingActionButton
                        val userMsg = prompt
                        prompt = ""
                        chatHistory = chatHistory + ChatMessage("user", userMsg)
                        scope.launch {
                            isLoading = true
                            try {
                                val url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=$GEMINI_API_KEY"
                                val systemPrompt = "Actúa como un productor musical experto. Responde en español, de forma breve y profesional."
                                val response: GeminiResponse = httpClient.post(url) {
                                    contentType(ContentType.Application.Json)
                                    setBody(buildJsonObject {
                                        putJsonArray("contents") {
                                            addJsonObject {
                                                putJsonArray("parts") { addJsonObject { put("text", "$systemPrompt\n\nConsulta: $userMsg") } }
                                            }
                                        }
                                    }.toString())
                                }.body()
                                val aiText = response.candidates?.firstOrNull()?.content?.parts?.firstOrNull()?.text ?: "No obtuve respuesta."
                                chatHistory = chatHistory + ChatMessage("ai", aiText)
                            } catch (e: Exception) {
                                chatHistory = chatHistory + ChatMessage("ai", "Error: ${e.message}")
                            } finally {
                                isLoading = false
                            }
                        }
                    },
                    containerColor = SmartuneColors.Primary,
                    shape = CircleShape,
                    modifier = Modifier.size(48.dp)
                ) {
                    Icon(Icons.Default.Send, contentDescription = "Send", tint = Color.White, modifier = Modifier.size(20.dp))
                }
            }
        } else {
            // Generate Mode
            Column(modifier = Modifier.weight(1f).verticalScroll(rememberScrollState())) {
                OutlinedTextField(
                    value = prompt,
                    onValueChange = { prompt = it },
                    placeholder = { Text("Un track de K-pop energético...", color = Color.Gray) },
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = SmartuneColors.Primary,
                        unfocusedBorderColor = SmartuneColors.Border,
                        focusedTextColor = Color.White, unfocusedTextColor = Color.White
                    ),
                    modifier = Modifier.fillMaxWidth().height(120.dp),
                    shape = RoundedCornerShape(20.dp),
                    label = { Text("Describe tu visión musical", fontSize = 10.sp) }
                )

                Spacer(modifier = Modifier.height(16.dp))

                Button(
                    onClick = {
                        if (prompt.isBlank() || isLoading) return@Button
                        scope.launch {
                            isLoading = true
                            generatedTrack = null
                            error = null
                            try {
                                val url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=$GEMINI_API_KEY"
                                val sysPrompt = """Actúa como productor de IA. Genera JSON: {"title":"...","artist":"...","mood":"...","bpm":120}. Solo JSON."""
                                val response: GeminiResponse = httpClient.post(url) {
                                    contentType(ContentType.Application.Json)
                                    setBody(buildJsonObject {
                                        putJsonArray("contents") {
                                            addJsonObject {
                                                putJsonArray("parts") { addJsonObject { put("text", "$sysPrompt\nPrompt: $prompt") } }
                                            }
                                        }
                                        putJsonObject("generationConfig") { put("response_mime_type", "application/json") }
                                    }.toString())
                                }.body()
                                val text = response.candidates?.firstOrNull()?.content?.parts?.firstOrNull()?.text
                                if (text != null) {
                                    val json = Json.parseToJsonElement(text).jsonObject
                                    generatedTrack = GeneratedTrack(
                                        title = json["title"]?.jsonPrimitive?.content ?: "Unknown",
                                        artist = json["artist"]?.jsonPrimitive?.content ?: "SmarTune AI",
                                        mood = json["mood"]?.jsonPrimitive?.content ?: "Dynamic",
                                        bpm = json["bpm"]?.jsonPrimitive?.int ?: 120
                                    )
                                }
                            } catch (e: Exception) {
                                generatedTrack = GeneratedTrack(
                                    title = "${prompt.take(15)} (AI Mix)",
                                    artist = "SmarTune IA",
                                    mood = "Experimental",
                                    bpm = 124
                                )
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
                            Text("GENERAR TRACK", fontWeight = FontWeight.ExtraBold, letterSpacing = 2.sp, fontSize = 16.sp)
                        }
                    }
                }

                // Result
                generatedTrack?.let { track ->
                    Spacer(modifier = Modifier.height(24.dp))
                    Card(
                        shape = RoundedCornerShape(24.dp),
                        colors = CardDefaults.cardColors(containerColor = SmartuneColors.Surface),
                        modifier = Modifier.fillMaxWidth().border(1.dp, SmartuneColors.Border, RoundedCornerShape(24.dp))
                    ) {
                        Column(modifier = Modifier.padding(20.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                AsyncImage(
                                    model = "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=200",
                                    contentDescription = track.title,
                                    contentScale = ContentScale.Crop,
                                    modifier = Modifier.size(80.dp).clip(RoundedCornerShape(16.dp))
                                )
                                Spacer(modifier = Modifier.width(16.dp))
                                Column {
                                    Text(track.title, color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.ExtraBold)
                                    Text(track.artist, color = SmartuneColors.Primary, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                                }
                            }
                            Spacer(modifier = Modifier.height(16.dp))
                            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                Card(
                                    shape = RoundedCornerShape(12.dp),
                                    colors = CardDefaults.cardColors(containerColor = SmartuneColors.GlassCard),
                                    modifier = Modifier.weight(1f).border(0.5.dp, SmartuneColors.Border, RoundedCornerShape(12.dp))
                                ) {
                                    Column(modifier = Modifier.padding(12.dp)) {
                                        Text("MOOD", color = Color.Gray, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                                        Text(track.mood, color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                    }
                                }
                                Card(
                                    shape = RoundedCornerShape(12.dp),
                                    colors = CardDefaults.cardColors(containerColor = SmartuneColors.GlassCard),
                                    modifier = Modifier.weight(1f).border(0.5.dp, SmartuneColors.Border, RoundedCornerShape(12.dp))
                                ) {
                                    Column(modifier = Modifier.padding(12.dp)) {
                                        Text("TEMPO", color = Color.Gray, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                                        Text("${track.bpm} BPM", color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                    }
                                }
                            }
                            Spacer(modifier = Modifier.height(16.dp))
                            Button(
                                onClick = {
                                    scope.launch {
                                        try {
                                            val supabase = com.smartune.app.data.SupabaseModule.client
                                            val userId = supabase.auth.currentUserOrNull()?.id ?: "anonymous"
                                            supabase.postgrest["favoritos"].insert(
                                                mapOf(
                                                    "usuario_id" to userId,
                                                    "cancion_id" to "ai_gen_${System.currentTimeMillis()}",
                                                    "titulo" to track.title,
                                                    "artista" to track.artist,
                                                    "cover_url" to "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400",
                                                    "genero" to track.mood
                                                )
                                            )
                                            // Optional: Show success
                                        } catch (e: Exception) { }
                                    }
                                },
                                modifier = Modifier.fillMaxWidth(),
                                colors = ButtonDefaults.buttonColors(containerColor = SmartuneColors.GlassCard),
                                shape = RoundedCornerShape(12.dp),
                                border = BorderStroke(0.5.dp, SmartuneColors.Border)
                            ) {
                                Text("❤️ Añadir a Mi Playlist", fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }

                error?.let {
                    Spacer(modifier = Modifier.height(12.dp))
                    Text("⚠️ $it", color = Color.Red, fontSize = 12.sp)
                }
            }
        }
    }
}
