package com.smartune.app.auth.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.smartune.app.core.supabase.SupabaseClient
import io.github.jan.supabase.gotrue.providers.builtin.Email
import io.github.jan.supabase.gotrue.providers.Google
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class AuthUiState(
    val isLoading: Boolean = false,
    val error: String? = null,
    val success: Boolean = false
)

class AuthViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(AuthUiState())
    val uiState = _uiState.asStateFlow()

    fun loginWithEmail(emailInput: String, passwordInput: String) {
        viewModelScope.launch {
            _uiState.value = AuthUiState(isLoading = true)
            try {
                SupabaseClient.auth.loginWith(Email) {
                    email = emailInput
                    password = passwordInput
                }
                _uiState.value = AuthUiState(success = true)
            } catch (e: Exception) {
                _uiState.value = AuthUiState(error = e.message ?: "Error al iniciar sesión")
            }
        }
    }

    fun registerWithEmail(emailInput: String, passwordInput: String, nombre: String) {
        viewModelScope.launch {
            _uiState.value = AuthUiState(isLoading = true)
            try {
                SupabaseClient.auth.signUpWith(Email) {
                    email = emailInput
                    password = passwordInput
                }
                // The trigger in Supabase auto-creates the profile in 'usuarios'
                _uiState.value = AuthUiState(success = true)
            } catch (e: Exception) {
                _uiState.value = AuthUiState(error = e.message ?: "Error al registrarse")
            }
        }
    }

    fun loginWithGoogle() {
        viewModelScope.launch {
            _uiState.value = AuthUiState(isLoading = true)
            try {
                SupabaseClient.auth.loginWith(Google)
                _uiState.value = AuthUiState(success = true)
            } catch (e: Exception) {
                _uiState.value = AuthUiState(error = e.message ?: "Error con Google")
            }
        }
    }

    fun logout() {
        viewModelScope.launch {
            try {
                SupabaseClient.auth.logout()
            } catch (_: Exception) {}
        }
    }

    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }
}
