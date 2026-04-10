package com.smartune.app.explorar.ui

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import coil.compose.AsyncImage
import com.smartune.app.core.supabase.SupabaseClient
import com.smartune.app.core.theme.*
import com.smartune.app.explorar.data.models.Post
import androidx.compose.material.ExperimentalMaterialApi
import androidx.compose.material.pullrefresh.PullRefreshIndicator
import androidx.compose.material.pullrefresh.pullRefresh
import androidx.compose.material.pullrefresh.rememberPullRefreshState
import com.smartune.app.explorar.viewmodel.ExplorarViewModel

@OptIn(ExperimentalMaterialApi::class)
@Composable
fun ExplorarScreen(
    navController: NavController,
    viewModel: ExplorarViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val snackbarHostState = remember { SnackbarHostState() }

    // Show post errors in snackbar
    LaunchedEffect(uiState.postError) {
        uiState.postError?.let { snackbarHostState.showSnackbar(it) }
    }

    // Safely get current user's avatar for the composer
    val currentUser = remember { SupabaseClient.auth.currentSessionOrNull()?.user }
    val currentAvatarUrl: String = remember(currentUser) {
        val meta = currentUser?.userMetadata
        val raw = meta?.get("avatar_url")?.toString()?.trim('"') ?: ""
        raw.ifEmpty { "https://ui-avatars.com/api/?background=0D0D0D&color=F2359D&bold=true&name=Yo" }
    }

    val pullRefreshState = rememberPullRefreshState(
        refreshing = uiState.isRefreshing,
        onRefresh = { viewModel.refreshFeed() }
    )

    Scaffold(
        containerColor = BgMain,
        snackbarHost = {
            SnackbarHost(snackbarHostState) { data ->
                Snackbar(
                    snackbarData = data,
                    containerColor = NeonRed.copy(alpha = 0.9f),
                    contentColor = TextPrimary
                )
            }
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .pullRefresh(pullRefreshState)
        ) {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .background(BgMain),
                contentPadding = PaddingValues(bottom = 16.dp)
            ) {
                item {
                    CreatePostComposer(
                        isPosting = uiState.isPosting,
                        currentAvatarUrl = currentAvatarUrl,
                        context = context,
                        onPost = { content, bytes, name -> viewModel.createPost(content, bytes, name) }
                    )
                }

                item { Spacer(modifier = Modifier.height(12.dp)) }

                if (uiState.isLoading) {
                    item {
                        Box(modifier = Modifier.fillMaxWidth().padding(48.dp), contentAlignment = Alignment.Center) {
                            CircularProgressIndicator(color = NeonPink, modifier = Modifier.size(32.dp))
                        }
                    }
                } else if (uiState.posts.isEmpty()) {
                    item {
                        Column(
                            modifier = Modifier.fillMaxWidth().padding(48.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Icon(Icons.Default.Image, contentDescription = null, tint = TextTertiary, modifier = Modifier.size(48.dp))
                            Spacer(modifier = Modifier.height(12.dp))
                            Text("Aún no hay publicaciones", fontWeight = FontWeight.Bold, color = TextSecondary)
                            Text("Sé el primero en compartir algo", fontSize = 13.sp, color = TextTertiary)
                        }
                    }
                } else {
                    items(uiState.posts, key = { it.id }) { post ->
                        PostCardItem(
                            post = post,
                            comments = uiState.comments[post.id] ?: emptyList(),
                            onLike = { viewModel.toggleLike(post.id, post.hasLiked) },
                            onLoadComments = { viewModel.loadComments(post.id) },
                            onAddComment = { content -> viewModel.addComment(post.id, content) }
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                    }
                }
            }

            PullRefreshIndicator(
                refreshing = uiState.isRefreshing,
                state = pullRefreshState,
                modifier = Modifier.align(Alignment.TopCenter),
                backgroundColor = BgCard,
                contentColor = NeonPink
            )
        }
    }
}



@Composable
private fun CreatePostComposer(
    isPosting: Boolean,
    currentAvatarUrl: String,
    context: android.content.Context,
    onPost: (String, ByteArray?, String?) -> Unit
) {
    var content by remember { mutableStateOf("") }
    var selectedImageUri by remember { mutableStateOf<Uri?>(null) }
    var expanded by remember { mutableStateOf(false) }
    val MAX_CHARS = 500

    val launcher = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        selectedImageUri = uri
        if (uri != null) expanded = true
    }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = BgCard)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.Top) {
                AsyncImage(
                    model = currentAvatarUrl,
                    contentDescription = null,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier
                        .size(40.dp)
                        .clip(CircleShape)
                        .background(NeonPurple)
                )
                Spacer(modifier = Modifier.width(12.dp))
                OutlinedTextField(
                    value = content,
                    onValueChange = { if (it.length <= MAX_CHARS) { content = it; if (it.isNotEmpty()) expanded = true } },
                    placeholder = { Text("¿Qué está pulsando hoy?", color = TextTertiary, fontSize = 14.sp) },
                    modifier = Modifier.weight(1f),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = NeonPink.copy(alpha = 0.3f),
                        unfocusedBorderColor = TextTertiary.copy(alpha = 0.1f),
                        focusedTextColor = TextPrimary,
                        unfocusedTextColor = TextPrimary,
                        cursorColor = NeonPink,
                        focusedContainerColor = BgMain.copy(alpha = 0.5f),
                        unfocusedContainerColor = BgMain.copy(alpha = 0.5f),
                    ),
                    shape = RoundedCornerShape(12.dp),
                    maxLines = if (expanded) 5 else 2
                )
            }

            // Image preview
            if (selectedImageUri != null) {
                Spacer(modifier = Modifier.height(8.dp))
                Box {
                    AsyncImage(
                        model = selectedImageUri,
                        contentDescription = null,
                        contentScale = ContentScale.Crop,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(180.dp)
                            .clip(RoundedCornerShape(12.dp))
                    )
                    IconButton(
                        onClick = { selectedImageUri = null },
                        modifier = Modifier
                            .align(Alignment.TopEnd)
                            .padding(4.dp)
                            .size(28.dp)
                            .background(BgMain.copy(alpha = 0.7f), CircleShape)
                    ) {
                        Icon(Icons.Default.Close, contentDescription = "Quitar imagen", tint = TextPrimary, modifier = Modifier.size(16.dp))
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))
            // Toolbar row
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = { launcher.launch("image/*") }, modifier = Modifier.size(36.dp)) {
                    Icon(Icons.Default.Image, contentDescription = "Adjuntar imagen", tint = NeonPink, modifier = Modifier.size(22.dp))
                }
                Spacer(modifier = Modifier.weight(1f))
                Text(
                    "${content.length}/$MAX_CHARS",
                    fontSize = 11.sp,
                    color = if (content.length > MAX_CHARS * 0.9) NeonPink else TextTertiary
                )
                Spacer(modifier = Modifier.width(12.dp))
                Button(
                    onClick = {
                        val imageBytes = selectedImageUri?.let { uri ->
                            context.contentResolver.openInputStream(uri)?.readBytes()
                        }
                        val imageName = selectedImageUri?.lastPathSegment
                        onPost(content, imageBytes, imageName)
                        content = ""
                        selectedImageUri = null
                        expanded = false
                    },
                    enabled = content.isNotBlank() && !isPosting,
                    shape = RoundedCornerShape(20.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = NeonPink),
                    contentPadding = PaddingValues(horizontal = 20.dp, vertical = 8.dp),
                    modifier = Modifier.height(36.dp)
                ) {
                    if (isPosting) CircularProgressIndicator(color = TextPrimary, modifier = Modifier.size(14.dp), strokeWidth = 2.dp)
                    else Text("Publicar", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                }
            }
        }
    }
}

@Composable
private fun PostCardItem(
    post: Post,
    comments: List<com.smartune.app.explorar.data.models.Comment>,
    onLike: () -> Unit,
    onLoadComments: () -> Unit,
    onAddComment: (String) -> Unit
) {
    var showComments by remember { mutableStateOf(false) }
    var saved by remember { mutableStateOf(false) }
    var commentText by remember { mutableStateOf("") }

    val avatarUrl = post.avatarUrl ?: "https://ui-avatars.com/api/?background=f6339a&color=fff&bold=true&size=128&name=${post.username ?: "U"}"

    Card(
        modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = BgCard)
    ) {
        Column {
            // ── Header ──
            Row(
                modifier = Modifier.fillMaxWidth().padding(12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                AsyncImage(
                    model = avatarUrl,
                    contentDescription = null,
                    modifier = Modifier
                        .size(42.dp)
                        .clip(CircleShape)
                        .background(
                            brush = Brush.linearGradient(listOf(NeonPink, NeonPurple, NeonBlue)),
                            shape = CircleShape
                        ),
                    contentScale = ContentScale.Crop
                )
                Spacer(modifier = Modifier.width(10.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(post.username ?: "Usuario", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = TextPrimary)
                        Spacer(modifier = Modifier.width(4.dp))
                        Icon(Icons.Default.Verified, contentDescription = null, tint = NeonBlue, modifier = Modifier.size(14.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("•", color = TextTertiary, fontSize = 12.sp)
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(formatTimeAgo(post.createdAt), color = TextTertiary, fontSize = 12.sp)
                    }
                }
                
                Button(
                    onClick = { /* Follow action */ },
                    colors = ButtonDefaults.buttonColors(containerColor = NeonPink),
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 0.dp),
                    modifier = Modifier.height(28.dp),
                    shape = RoundedCornerShape(14.dp)
                ) {
                    Text("Seguir", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
                }
            }

            // ── Content ──
            Text(
                text = post.content,
                fontSize = 14.sp,
                color = TextPrimary.copy(alpha = 0.85f),
                lineHeight = 20.sp,
                modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp)
            )

            // ── Image ──
            post.imageUrl?.let { url ->
                Spacer(modifier = Modifier.height(8.dp))
                AsyncImage(
                    model = url,
                    contentDescription = null,
                    modifier = Modifier.fillMaxWidth().heightIn(max = 400.dp),
                    contentScale = ContentScale.Crop
                )
            }

            // ── Action Bar ──
            Row(
                modifier = Modifier.fillMaxWidth().padding(horizontal = 12.dp, vertical = 10.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                    // Like
                    Row(
                        modifier = Modifier.clickable { onLike() },
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Icon(
                            if (post.hasLiked) Icons.Filled.Favorite else Icons.Filled.FavoriteBorder,
                            contentDescription = "Like",
                            tint = if (post.hasLiked) NeonPink else TextSecondary,
                            modifier = Modifier.size(22.dp)
                        )
                        Text(formatCount(post.likesCount), fontSize = 13.sp, color = TextSecondary)
                    }

                    // Comment
                    Row(
                        modifier = Modifier.clickable {
                            showComments = !showComments
                            if (showComments) onLoadComments()
                        },
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Icon(Icons.Default.ChatBubbleOutline, contentDescription = "Comment", tint = TextSecondary, modifier = Modifier.size(22.dp))
                        Text(formatCount(post.commentsCount), fontSize = 13.sp, color = TextSecondary)
                    }

                    // Send
                    Icon(Icons.Default.Send, contentDescription = "Share", tint = TextSecondary, modifier = Modifier.size(22.dp))
                }

                // Bookmark
                Icon(
                    if (saved) Icons.Filled.Bookmark else Icons.Filled.BookmarkBorder,
                    contentDescription = "Save",
                    tint = TextSecondary,
                    modifier = Modifier.size(22.dp).clickable { saved = !saved }
                )
            }

            // ── Comments ──
            if (showComments) {
                HorizontalDivider(color = TextTertiary.copy(alpha = 0.1f))
                Column(modifier = Modifier.padding(12.dp)) {
                    comments.forEach { comment ->
                        Row(modifier = Modifier.padding(vertical = 4.dp)) {
                            Text(comment.usuarios?.nombre ?: "Usuario", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = TextPrimary)
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(comment.content, fontSize = 13.sp, color = TextSecondary, maxLines = 3, overflow = TextOverflow.Ellipsis)
                        }
                    }

                    if (comments.isEmpty()) {
                        Text("Sin comentarios aún", color = TextTertiary, fontSize = 13.sp, modifier = Modifier.padding(vertical = 8.dp))
                    }

                    // Add comment
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.SentimentSatisfied, contentDescription = null, tint = TextTertiary, modifier = Modifier.size(20.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        OutlinedTextField(
                            value = commentText,
                            onValueChange = { commentText = it },
                            placeholder = { Text("Añade un comentario...", fontSize = 13.sp, color = TextTertiary) },
                            modifier = Modifier.weight(1f),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = NeonPink.copy(0.2f),
                                unfocusedBorderColor = TextTertiary.copy(0.1f),
                                focusedTextColor = TextPrimary,
                                unfocusedTextColor = TextPrimary,
                                cursorColor = NeonPink,
                            ),
                            shape = RoundedCornerShape(20.dp),
                            singleLine = true
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        TextButton(
                            onClick = { onAddComment(commentText); commentText = "" },
                            enabled = commentText.isNotBlank()
                        ) {
                            Text("Publicar", color = if (commentText.isNotBlank()) NeonBlue else TextTertiary, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        }
                    }
                }
            }
        }
    }
}

private fun formatTimeAgo(dateStr: String): String {
    return try {
        val diffMs = System.currentTimeMillis() - java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", java.util.Locale.getDefault()).apply { timeZone = java.util.TimeZone.getTimeZone("UTC") }.parse(dateStr.take(19))!!.time
        val mins = diffMs / 60000
        when {
            mins < 60 -> "${mins.coerceAtLeast(1)}m"
            mins < 1440 -> "${mins / 60}h"
            else -> "${mins / 1440}d"
        }
    } catch (_: Exception) { "ahora" }
}

private fun formatCount(n: Int): String = when {
    n >= 1000000 -> "${(n / 1000000.0).let { "%.1f".format(it) }}M"
    n >= 1000 -> "${(n / 1000.0).let { "%.1f".format(it) }}k"
    else -> n.toString()
}
