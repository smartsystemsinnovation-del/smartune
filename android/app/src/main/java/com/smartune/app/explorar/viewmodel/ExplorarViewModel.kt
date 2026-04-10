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
import com.smartune.app.core.supabase.SupabaseClient
import io.github.jan.supabase.realtime.*
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach

data class ExplorarUiState(
    val posts: List<Post> = emptyList(),
    val isLoading: Boolean = true,
    val isPosting: Boolean = false,
    val isRefreshing: Boolean = false,
    val comments: Map<String, List<Comment>> = emptyMap(),
    val error: String? = null,
    val postError: String? = null
)

class ExplorarViewModel : ViewModel() {
    private val repo = SocialRepository()
    private val _uiState = MutableStateFlow(ExplorarUiState())
    val uiState = _uiState.asStateFlow()

    init { 
        loadFeed()
        subscribeToRealtime()
    }

    private fun subscribeToRealtime() {
        viewModelScope.launch {
            try {
                val channel = SupabaseClient.realtime.channel("social-feed")
                // Watch BOTH posts AND likes for instant updates
                val postsFlow = channel.postgresChangeFlow<PostgresAction>(schema = "public") {
                    table = "posts"
                }
                val likesFlow = channel.postgresChangeFlow<PostgresAction>(schema = "public") {
                    table = "likes"
                }
                postsFlow.onEach { loadFeed() }.launchIn(viewModelScope)
                likesFlow.onEach { loadFeed() }.launchIn(viewModelScope)
                channel.subscribe()
            } catch (e: Exception) {
                // Ignore gracefully if realtime fails
            }
        }
    }

    fun loadFeed() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            val posts = repo.getFeed()
            _uiState.value = _uiState.value.copy(posts = posts, isLoading = false, isRefreshing = false)
        }
    }

    fun refreshFeed() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isRefreshing = true)
            val posts = repo.getFeed()
            _uiState.value = _uiState.value.copy(posts = posts, isRefreshing = false)
        }
    }

    fun createPost(content: String, imageBytes: ByteArray? = null, imageName: String? = null) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isPosting = true, postError = null)
            val error = repo.createPost(content, imageBytes, imageName)
            if (error == null) {
                loadFeed()
            } else {
                _uiState.value = _uiState.value.copy(postError = error)
            }
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
        // Optimistic UI for comments
        val optimisticComment = Comment(
            id = "temp_${System.currentTimeMillis()}",
            content = content,
            createdAt = java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", java.util.Locale.getDefault()).apply {
                timeZone = java.util.TimeZone.getTimeZone("UTC")
            }.format(java.util.Date()),
            usuarios = com.smartune.app.explorar.data.models.CommentUser(nombre = "Tú", avatarUrl = null)
        )
        
        val currentComments = _uiState.value.comments[postId] ?: emptyList()
        _uiState.value = _uiState.value.copy(
            comments = _uiState.value.comments + (postId to (currentComments + optimisticComment)),
            posts = _uiState.value.posts.map { p ->
                if (p.id == postId) p.copy(commentsCount = p.commentsCount + 1) else p
            }
        )

        viewModelScope.launch {
            val success = repo.addComment(postId, content)
            if (success) {
                // Background refresh to get real ID and user details
                loadComments(postId)
            } else {
                // Revert on failure
                _uiState.value = _uiState.value.copy(
                    comments = _uiState.value.comments + (postId to currentComments),
                    posts = _uiState.value.posts.map { p ->
                        if (p.id == postId) p.copy(commentsCount = p.commentsCount - 1) else p
                    }
                )
            }
        }
    }
}
