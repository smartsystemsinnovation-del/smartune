package com.smartune.app.home.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.smartune.app.core.network.model.Cancion
import com.smartune.app.core.network.model.Instrumento
import com.smartune.app.home.data.repository.HomeRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class HomeUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val lanzamientos: List<Cancion> = emptyList(),
    val instrumentos: List<Instrumento> = emptyList(),
    val misClases: List<com.smartune.app.explorar.data.models.ClaseAgendada> = emptyList(),
    val isAlumnosView: Boolean = true
)

class HomeViewModel : ViewModel() {
    private val repo = HomeRepository()
    private val socialRepo = com.smartune.app.explorar.data.repository.SocialRepository()
    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState = _uiState.asStateFlow()

    init {
        fetchHomeData()
    }

    private fun fetchHomeData(isRefresh: Boolean = false) {
        viewModelScope.launch {
            if (isRefresh) {
                _uiState.value = _uiState.value.copy(isRefreshing = true)
            } else {
                _uiState.value = _uiState.value.copy(isLoading = true)
            }

            val canciones = repo.getNuevosLanzamientos()
            val instrumentos = repo.getTopInstrumentos()
            val clases = socialRepo.getMisClases()
            
            // Filter classes for today or future ones
            val now = java.time.Instant.now()
            val upcomingClases = clases.filter {
                try {
                    val claseTime = java.time.Instant.parse(it.fechaInicio)
                    claseTime.isAfter(now.minusSeconds(3600)) // Include classes up to 1 hour ago
                } catch(e: Exception) { true }
            }.take(3)

            _uiState.value = _uiState.value.copy(
                isLoading = false,
                isRefreshing = false,
                lanzamientos = canciones,
                instrumentos = instrumentos,
                misClases = upcomingClases
            )
        }
    }

    fun refresh() = fetchHomeData(isRefresh = true)

    fun toggleInstrumentosView() {
        _uiState.value = _uiState.value.copy(isAlumnosView = !_uiState.value.isAlumnosView)
    }
}
