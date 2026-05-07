package com.smartune.app.favoritos.viewmodel

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.smartune.app.core.supabase.SupabaseClient
import com.smartune.app.musicswipe.data.Favorito
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.query.Order
import kotlinx.coroutines.launch

class FavoritosViewModel : ViewModel() {
    var favoritos by mutableStateOf<List<Favorito>>(emptyList())
    var isLoading by mutableStateOf(true)
    var error by mutableStateOf<String?>(null)

    init {
        fetchFavoritos()
    }

    fun fetchFavoritos() {
        viewModelScope.launch {
            isLoading = true
            error = null
            try {
                val session = SupabaseClient.auth.currentSessionOrNull()
                val userId = session?.user?.id
                
                if (userId == null) {
                    error = "No hay sesión activa. Inicia sesión para ver tus favoritos."
                    isLoading = false
                    return@launch
                }

                val results = SupabaseClient.client
                    .from("favoritos")
                    .select {
                        filter { eq("usuario_id", userId) }
                        order("fecha_like", Order.DESCENDING)
                    }
                    .decodeList<Favorito>()

                favoritos = results
            } catch (e: Exception) {
                e.printStackTrace()
                error = "Error al cargar favoritos: ${e.message}"
            } finally {
                isLoading = false
            }
        }
    }
}
