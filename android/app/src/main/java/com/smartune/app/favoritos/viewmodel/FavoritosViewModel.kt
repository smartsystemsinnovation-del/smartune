package com.smartune.app.favoritos.viewmodel

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.smartune.app.core.supabase.SupabaseClient
import com.smartune.app.musicswipe.data.Favorito
import io.github.jan.supabase.postgrest.from
import kotlinx.coroutines.launch

class FavoritosViewModel : ViewModel() {
    var favoritos by mutableStateOf<List<Favorito>>(emptyList())
    var isLoading by mutableStateOf(true)

    init {
        fetchFavoritos()
    }

    fun fetchFavoritos() {
        viewModelScope.launch {
            isLoading = true
            try {
                val userId = SupabaseClient.auth.currentSessionOrNull()?.user?.id ?: return@launch
                
                val results = SupabaseClient.client.from("favoritos")
                    .select {
                        filter {
                            eq("usuario_id", userId)
                        }
                    }.decodeList<Favorito>()
                
                // Sort descending by id since fecha_like might be problematic to parse depending on format
                favoritos = results.sortedByDescending { it.id }
            } catch (e: Exception) {
                e.printStackTrace()
            } finally {
                isLoading = false
            }
        }
    }
}
