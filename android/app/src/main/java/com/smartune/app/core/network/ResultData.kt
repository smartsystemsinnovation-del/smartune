package com.smartune.app.core.network

/**
 * Monad centralizado para manejo estandarizado de Errores y Estados de Carga
 * Reemplaza los bloques try-catch aislados en cada ViewModel.
 */
sealed class ResultData<out T> {
    object Loading : ResultData<Nothing>()
    data class Success<out T>(val data: T) : ResultData<T>()
    data class Error(
        val message: String,
        val exception: Exception? = null,
        val code: Int? = null
    ) : ResultData<Nothing>()
    
    val isSuccess get() = this is Success
    val isError get() = this is Error
    val isLoading get() = this is Loading

    fun getOrNull(): T? = (this as? Success)?.data
    fun exceptionOrNull(): Exception? = (this as? Error)?.exception
}

/**
 * Función extendida para ejecutar llamadas de red de forma segura dentro de corrutinas
 * y transformar excepciones (timeout, server error, etc.) en un ResultData.Error
 */
suspend fun <T> safeApiCall(apiCall: suspend () -> T): ResultData<T> {
    return try {
        ResultData.Success(apiCall.invoke())
    } catch (e: io.ktor.client.plugins.ResponseException) {
        // Maneja errores provenientes directamente del servidor Ktor
        ResultData.Error(
            message = "Error de Servidor: ${e.response.status.value}", 
            exception = e,
            code = e.response.status.value
        )
    } catch (e: Exception) {
        // Maneja errores locales del hardware (internet), parsing o timeout
        ResultData.Error(
            message = e.localizedMessage ?: "Ocurrió un error inesperado al conectar.",
            exception = e
        )
    }
}
