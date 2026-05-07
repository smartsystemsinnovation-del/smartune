package com.smartune.app.profile.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.smartune.app.explorar.data.models.Post
import com.smartune.app.explorar.data.models.UserProfile
import com.smartune.app.explorar.data.repository.SocialRepository
import kotlinx.coroutines.async
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class ProfileUiState(
    val isLoading: Boolean = true,
    val profile: UserProfile? = null,
    val followersCount: Int = 0,
    val isFollowing: Boolean = false,
    val posts: List<Post> = emptyList(),
    val likedPosts: List<Post> = emptyList(),
    val activeTab: String = "grid",
    val error: String? = null
)

class ProfileViewModel : ViewModel() {
    private val repo = SocialRepository()
    private val _uiState = MutableStateFlow(ProfileUiState())
    val uiState = _uiState.asStateFlow()

    fun loadProfile(userId: String) {
        viewModelScope.launch {
            // Always reset so we re-fetch fresh state from Supabase every open
            _uiState.value = ProfileUiState(isLoading = true)

            try {
                // Fire all requests in parallel for speed
                val profileDeferred     = async { repo.getUserProfile(userId) }
                val followersDeferred   = async { repo.getFollowersCount(userId) }
                val isFollowingDeferred = async { repo.checkIsFollowing(userId) }
                val postsDeferred       = async { repo.getUserPosts(userId) }
                val likedPostsDeferred  = async { repo.getUserLikedPosts(userId) }

                val profile = profileDeferred.await()
                if (profile == null) {
                    _uiState.value = _uiState.value.copy(isLoading = false, error = "Usuario no encontrado")
                    return@launch
                }

                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    profile = profile,
                    followersCount = followersDeferred.await(),
                    isFollowing = isFollowingDeferred.await(), // Always fresh from Supabase
                    posts = postsDeferred.await(),
                    likedPosts = likedPostsDeferred.await()
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(isLoading = false, error = e.message)
            }
        }
    }

    fun toggleFollow(userId: String) {
        val wasFollowing = _uiState.value.isFollowing

        // Optimistic UI update
        _uiState.value = _uiState.value.copy(
            isFollowing = !wasFollowing,
            followersCount = if (!wasFollowing)
                _uiState.value.followersCount + 1
            else
                (_uiState.value.followersCount - 1).coerceAtLeast(0)
        )

        viewModelScope.launch {
            val success = repo.toggleFollow(userId, wasFollowing)
            if (!success) {
                // Revert on failure
                _uiState.value = _uiState.value.copy(
                    isFollowing = wasFollowing,
                    followersCount = if (wasFollowing)
                        _uiState.value.followersCount + 1
                    else
                        (_uiState.value.followersCount - 1).coerceAtLeast(0)
                )
            } else {
                // Confirm real state from DB (ensures cross-platform sync)
                val realIsFollowing = repo.checkIsFollowing(userId)
                val realCount = repo.getFollowersCount(userId)
                _uiState.value = _uiState.value.copy(
                    isFollowing = realIsFollowing,
                    followersCount = realCount
                )
            }
        }
    }

    fun setActiveTab(tab: String) {
        _uiState.value = _uiState.value.copy(activeTab = tab)
    }
}
