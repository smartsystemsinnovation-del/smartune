package com.smartune.app.data.repository

import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.functions.functions
import io.github.jan.supabase.postgrest.postgrest
import io.ktor.client.call.body
import kotlinx.serialization.Serializable

@Serializable
data class PracticeRequest(
    val id_usuario: String,
    val id_cancion: String,
    val calidad_respuesta: Int
)

@Serializable
data class PracticeResponse(
    val success: Boolean,
    val next_practice: String? = null,
    val factor_facilidad: Float? = null,
    val intervalo: Int? = null,
    val error: String? = null
)

class PracticeRepository(private val supabase: SupabaseClient) {

    /**
     * Sincroniza el estado de la práctica actual con la nube para disparar
     * el recalculo del algoritmo SuperMemo-2 en la Supabase Edge Function.
     */
    suspend fun syncPracticeCompletion(userId: String, songId: String, score: Int): Result<PracticeResponse> {
        return try {
            val requestBody = PracticeRequest(
                id_usuario = userId,
                id_cancion = songId,
                calidad_respuesta = score
            )

            // Llama a la Edge Function "ebbinghaus-scheduler" usando el cliente oficial
            val response = supabase.functions.invoke(
                function = "ebbinghaus-scheduler",
                body = requestBody
            )

            // Aquí extraemos el body ya que la SDK moderna retorna un Ktor HttpResponse
            val result = response.body<PracticeResponse>()
            if (result.success) {
                Result.success(result)
            } else {
                Result.failure(Exception(result.error ?: "Unknown error occurred on scheduler"))
            }

        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Consulta localmente la lista de tareas pendientes para mostrar
     * (Equivalente al Tareas del Día del web).
     */
    suspend fun getDailyTasks(userId: String): Result<List<Map<String, Any>>> {
        return try {
            val todayIso = java.time.Instant.now().toString()
            val data = supabase.postgrest["historial_usuario"]
                .select() {
                    filter {
                        eq("usuario_id", userId)
                        lte("proxima_practica", todayIso)
                    }
                }.decodeList<Map<String, Any>>()
                
            Result.success(data)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
