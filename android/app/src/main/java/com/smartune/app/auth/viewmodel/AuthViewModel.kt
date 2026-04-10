package com.smartune.app.auth.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.smartune.app.core.supabase.SupabaseClient
import com.smartune.app.explorar.data.repository.SocialRepository
import io.github.jan.supabase.gotrue.providers.builtin.Email
import io.github.jan.supabase.gotrue.providers.Google
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put

data class AuthUiState(
    val isLoading: Boolean = false,
    val error: String? = null,
    val success: Boolean = false,
    val isUpdateMode: Boolean = false,
    val message: String? = null
)

class AuthViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(AuthUiState())
    val uiState = _uiState.asStateFlow()
    private val socialRepo = SocialRepository()

    fun loginWithEmail(emailInput: String, passwordInput: String) {
        viewModelScope.launch {
            _uiState.value = AuthUiState(isLoading = true)
            try {
                SupabaseClient.auth.signInWith(Email) {
                    email = emailInput
                    password = passwordInput
                }
                val syncError = socialRepo.syncUserProfile()
                if (syncError != null) {
                    // Still consider login success, just log the sync issue
                    android.util.Log.w("AuthViewModel", "syncUserProfile failed: $syncError")
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
                    data = buildJsonObject {
                        put("full_name", JsonPrimitive(nombre))
                        put("name", JsonPrimitive(nombre))
                    }
                }
                // Also manually insert into usuarios to guarantee record exists
                val syncError = socialRepo.syncUserProfile()
                if (syncError != null) {
                    _uiState.value = AuthUiState(error = "Registro OK pero error de perfil: $syncError")
                } else {
                    _uiState.value = AuthUiState(success = true)
                }
            } catch (e: Exception) {
                _uiState.value = AuthUiState(error = e.message ?: "Error al registrarse")
            }
        }
    }

    fun loginWithGoogle() {
        viewModelScope.launch {
            _uiState.value = AuthUiState(isLoading = true)
            try {
                SupabaseClient.auth.signInWith(Google)
                socialRepo.syncUserProfile() // Ensure Google users land in public.usuarios
                _uiState.value = AuthUiState(success = true)
            } catch (e: Exception) {
                _uiState.value = AuthUiState(error = e.message ?: "Error con Google")
            }
        }
    }

    fun resetPassword(emailInput: String) {
        viewModelScope.launch {
            _uiState.value = AuthUiState(isLoading = true)
            try {
                SupabaseClient.auth.resetPasswordForEmail(
                    email = emailInput,
                    redirectUrl = "smartune-auth://callback?type=recovery"
                )
                _uiState.value = AuthUiState(success = true, message = "Enlace enviado. Revisa tu correo.")
            } catch (e: Exception) {
                _uiState.value = AuthUiState(error = e.message ?: "Error al enviar enlace")
            }
        }
    }

    fun updateUserPassword(newPasswordInput: String) {
        viewModelScope.launch {
            _uiState.value = uiState.value.copy(isLoading = true, error = null, message = null)
            try {
                SupabaseClient.auth.modifyUser {
                    password = newPasswordInput
                }
                _uiState.value = uiState.value.copy(isLoading = false, success = true, isUpdateMode = false, message = "Contraseña actualizada exitosamente")
            } catch (e: Exception) {
                _uiState.value = uiState.value.copy(isLoading = false, error = e.message ?: "Error al actualizar contraseña")
            }
        }
    }

    fun setUpdateMode(enabled: Boolean) {
        _uiState.value = _uiState.value.copy(isUpdateMode = enabled)
    }

    fun logout() {
        viewModelScope.launch {
            try {
                SupabaseClient.auth.signOut()
            } catch (_: Exception) {}
        }
    }

    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null, message = null)
    }
}
