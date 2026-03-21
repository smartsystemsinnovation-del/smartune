package com.smartune.app.explorar.viewmodel

import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.smartune.app.explorar.data.models.Comment
import com.smartune.app.explorar.data.models.Post
import com.smartune.app.explorar.data.repository.SocialRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class ExplorarUiState(
    val posts: List<Post> = emptyList(),
    val isLoading: Boolean = true,
    val isPosting: Boolean = false,
    val comments: Map<String, List<Comment>> = emptyMap(),
    val error: String? = null
)

class ExplorarViewModel : ViewModel() {
    private val repo = SocialRepository()
    private val _uiState = MutableStateFlow(ExplorarUiState())
    val uiState = _uiState.asStateFlow()

    init { loadFeed() }

    fun loadFeed() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            val posts = repo.getFeed()
            _uiState.value = _uiState.value.copy(posts = posts, isLoading = false)
        }
    }

    fun createPost(content: String, imageBytes: ByteArray? = null, imageName: String? = null) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isPosting = true)
            val success = repo.createPost(content, imageBytes, imageName)
            if (success) loadFeed()
            _uiState.value = _uiState.value.copy(isPosting = false)
        }
    }

    fun toggleLike(postId: String, currentlyLiked: Boolean) {
        // Optimistic UI
        _uiState.value = _uiState.value.copy(
            posts = _uiState.value.posts.map { p ->
                if (p.id == postId) p.copy(
                    hasLiked = !currentlyLiked,
                    likesCount = if (currentlyLiked) p.likesCount - 1 else p.likesCount + 1
                ) else p
            }
        )
        viewModelScope.launch {
            val success = repo.toggleLike(postId, currentlyLiked)
            if (!success) {
                // Revert
                _uiState.value = _uiState.value.copy(
                    posts = _uiState.value.posts.map { p ->
                        if (p.id == postId) p.copy(
                            hasLiked = currentlyLiked,
                            likesCount = if (currentlyLiked) p.likesCount + 1 else p.likesCount - 1
                        ) else p
                    }
                )
            }
        }
    }

    fun loadComments(postId: String) {
        viewModelScope.launch {
            val comments = repo.getComments(postId)
            _uiState.value = _uiState.value.copy(
                comments = _uiState.value.comments + (postId to comments)
            )
        }
    }

    fun addComment(postId: String, content: String) {
        viewModelScope.launch {
            repo.addComment(postId, content)
            loadComments(postId)
        }
    }
}
