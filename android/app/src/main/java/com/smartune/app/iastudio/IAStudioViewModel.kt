package com.smartune.app.iastudio

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.engine.android.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.coroutines.launch
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

@Serializable
data class MusicRequest(val prompt: String, val mode: String)

@Serializable
data class MusicResponse(
    val id: String? = null,
    val title: String? = null,
    val artist: String? = null,
    val mood: String? = null,
    val bpm: Int? = null,
    val coverUrl: String? = null,
    val audioUrl: String? = null,
    val text: String? = null,
    val error: String? = null,
    val details: String? = null
)

class IAStudioViewModel : ViewModel() {
    // ── Conexión a tu Backend de Producción en Vercel ──────
    private val BASE_URL = "https://smar-tune.vercel.app" 

    private val client = HttpClient(Android) {
        install(ContentNegotiation) {
            json(Json {
                ignoreUnknownKeys = true
                prettyPrint = true
                isLenient = true
            })
        }
    }

    var mode by mutableStateOf("chat")
    var prompt by mutableStateOf("")
    var isGenerating by mutableStateOf(false)
    var error by mutableStateOf<String?>(null)
    var result by mutableStateOf<MusicResponse?>(null)
    
    val chatHistory = mutableStateListOf<Pair<String, String>>()

    fun handleAction() {
        val currentPrompt = prompt.trim()
        if (currentPrompt.isBlank()) return

        if (mode == "chat") {
            chatHistory.add(Pair("user", currentPrompt))
            prompt = ""
            executeAction(currentPrompt, "chat")
        } else {
            result = null
            executeAction(currentPrompt, "generate")
        }
    }

    private fun executeAction(promptText: String, actionMode: String) {
        viewModelScope.launch {
            isGenerating = true
            error = null
            try {
                val response: MusicResponse = client.post("$BASE_URL/api/generate-music") {
                    contentType(ContentType.Application.Json)
                    setBody(MusicRequest(promptText, actionMode))
                }.body()

                if (response.error != null) {
                    error = response.error
                } else {
                    if (actionMode == "chat") {
                        chatHistory.add(Pair("ai", response.text ?: "No recibí respuesta."))
                    } else {
                        result = response
                    }
                }
            } catch (e: Exception) {
                error = "Error de conexión: Verifica tu internet o el estado del servidor."
                if (actionMode == "chat") {
                    chatHistory.add(Pair("ai", "Perdón señor, no pude contactar al servidor principal."))
                }
            } finally {
                isGenerating = false
            }
        }
    }

    override fun onCleared() {
        super.onCleared()
        client.close()
    }
}
