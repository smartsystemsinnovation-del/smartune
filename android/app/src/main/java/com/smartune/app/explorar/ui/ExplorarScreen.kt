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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch
import kotlinx.coroutines.delay
import androidx.media3.common.MediaItem
import androidx.media3.exoplayer.ExoPlayer
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
                        onPost = { content, imageBytes, imageName, audioBytes, audioName ->
                            viewModel.createPost(content, imageBytes, imageName, audioBytes, audioName)
                        }
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
                            currentUserId = currentUser?.id,
                            context = context,
                            onLike = { viewModel.toggleLike(post.id, post.hasLiked) },
                            onLoadComments = { viewModel.loadComments(post.id) },
                            onAddComment = { content -> viewModel.addComment(post.id, content) },
                            onDelete = { viewModel.deletePost(post.id) },
                            onNavigateToProfile = { userId -> 
                                if (userId.isNotBlank()) {
                                    try {
                                        navController.navigate(com.smartune.app.core.navigation.Routes.publicProfile(userId))
                                    } catch (e: Exception) { e.printStackTrace() }
                                }
                            }
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
    onPost: (String, ByteArray?, String?, ByteArray?, String?) -> Unit
) {
    var content by remember { mutableStateOf("") }
    var selectedImageUri by remember { mutableStateOf<Uri?>(null) }
    var selectedAudioUri by remember { mutableStateOf<Uri?>(null) }
    val MAX_CHARS = 500

    val imageLauncher = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        selectedImageUri = uri
    }

    val audioLauncher = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        selectedAudioUri = uri
    }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = BgCard)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {

            // ── Header row: avatar + text field ──
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
                    onValueChange = { if (it.length <= MAX_CHARS) content = it },
                    placeholder = { Text("¿Qué está pulsando hoy?", color = TextTertiary, fontSize = 14.sp) },
                    modifier = Modifier.weight(1f),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = NeonPink.copy(alpha = 0.5f),
                        unfocusedBorderColor = TextTertiary.copy(alpha = 0.15f),
                        focusedTextColor = TextPrimary,
                        unfocusedTextColor = TextPrimary,
                        cursorColor = NeonPink,
                        focusedContainerColor = BgMain.copy(alpha = 0.5f),
                        unfocusedContainerColor = BgMain.copy(alpha = 0.5f),
                    ),
                    shape = RoundedCornerShape(12.dp),
                    maxLines = 5,
                    minLines = 2
                )
            }

            // ── Image preview ──
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

            // ── Audio preview ──
            if (selectedAudioUri != null) {
                Spacer(modifier = Modifier.height(8.dp))
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(BgMain.copy(alpha = 0.5f))
                        .border(1.dp, NeonPurple.copy(alpha = 0.5f), RoundedCornerShape(12.dp))
                        .padding(horizontal = 12.dp, vertical = 10.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(Icons.Default.Mic, contentDescription = "Audio", tint = NeonPurple, modifier = Modifier.size(22.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Audio seleccionado ✓", color = NeonPurple, fontSize = 13.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.weight(1f))
                    IconButton(
                        onClick = { selectedAudioUri = null },
                        modifier = Modifier.size(24.dp)
                    ) {
                        Icon(Icons.Default.Close, contentDescription = "Quitar audio", tint = TextTertiary, modifier = Modifier.size(16.dp))
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // ── Toolbar row: attach buttons + char count + publish ──
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Imagen
                IconButton(onClick = { imageLauncher.launch("image/*") }, modifier = Modifier.size(36.dp)) {
                    Icon(
                        Icons.Default.Image,
                        contentDescription = "Adjuntar imagen",
                        tint = if (selectedImageUri != null) NeonPink else NeonPink.copy(alpha = 0.5f),
                        modifier = Modifier.size(22.dp)
                    )
                }
                Spacer(modifier = Modifier.width(4.dp))
                // Audio
                IconButton(onClick = { audioLauncher.launch("audio/*") }, modifier = Modifier.size(36.dp)) {
                    Icon(
                        Icons.Default.Mic,
                        contentDescription = "Adjuntar audio",
                        tint = if (selectedAudioUri != null) NeonPurple else NeonPurple.copy(alpha = 0.5f),
                        modifier = Modifier.size(22.dp)
                    )
                }

                Spacer(modifier = Modifier.weight(1f))

                // Char counter
                Text(
                    "${content.length}/$MAX_CHARS",
                    fontSize = 11.sp,
                    color = if (content.length > MAX_CHARS * 0.9) NeonPink else TextTertiary
                )
                Spacer(modifier = Modifier.width(12.dp))

                // Publish button
                Button(
                    onClick = {
                        val imageBytes = selectedImageUri?.let { uri ->
                            context.contentResolver.openInputStream(uri)?.readBytes()
                        }
                        val imageName = selectedImageUri?.lastPathSegment

                        val audioBytes = selectedAudioUri?.let { uri ->
                            context.contentResolver.openInputStream(uri)?.readBytes()
                        }
                        val audioName = selectedAudioUri?.lastPathSegment

                        onPost(content, imageBytes, imageName, audioBytes, audioName)
                        content = ""
                        selectedImageUri = null
                        selectedAudioUri = null
                    },
                    enabled = (content.isNotBlank() || selectedImageUri != null || selectedAudioUri != null) && !isPosting,
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
fun PostCardItem(
    post: Post,
    comments: List<com.smartune.app.explorar.data.models.Comment>,
    currentUserId: String?,
    context: android.content.Context,
    onLike: () -> Unit,
    onLoadComments: () -> Unit,
    onAddComment: (String) -> Unit,
    onDelete: () -> Unit,
    onNavigateToProfile: (String) -> Unit = {}
) {
    var showComments by remember { mutableStateOf(false) }
    var saved by remember { mutableStateOf(false) }
    var commentText by remember { mutableStateOf("") }

    // ── Follow state per card ──
    val repo = remember { com.smartune.app.explorar.data.repository.SocialRepository() }
    val scope = rememberCoroutineScope()
    var isFollowing by remember { mutableStateOf<Boolean?>(null) } // null = loading

    // Load real follow state once when the card appears
    LaunchedEffect(post.userId) {
        if (currentUserId != null && currentUserId != post.userId) {
            isFollowing = repo.checkIsFollowing(post.userId)
        }
    }

    val avatarUrl = post.avatarUrl ?: "https://ui-avatars.com/api/?background=f6339a&color=fff&bold=true&size=128&name=${post.username ?: "U"}"

    Card(
        modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = BgCard)
    ) {
        Column {
            // ── Header ──
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onNavigateToProfile(post.userId) }
                    .padding(12.dp),
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
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(formatTimeAgo(post.createdAt), color = TextTertiary, fontSize = 12.sp)
                    }
                    if (post.rol == "profesor") {
                        Text("Profesor", color = NeonPink, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    } else if (post.rol != null) {
                        Text(post.rol.replaceFirstChar { if (it.isLowerCase()) it.titlecase(java.util.Locale.getDefault()) else it.toString() }, color = TextTertiary, fontSize = 11.sp)
                    }
                }
                
                if (currentUserId == post.userId) {
                    IconButton(onClick = onDelete, modifier = Modifier.size(32.dp)) {
                        Icon(Icons.Default.DeleteOutline, contentDescription = "Eliminar", tint = NeonRed, modifier = Modifier.size(20.dp))
                    }
                } else if (isFollowing != null) {
                    // Show button only when follow state is known
                    Button(
                        onClick = {
                            val wasFollowing = isFollowing == true
                            isFollowing = !wasFollowing // Optimistic
                            scope.launch {
                                val success = repo.toggleFollow(post.userId, wasFollowing)
                                if (!success) isFollowing = wasFollowing // Revert on failure
                            }
                        },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (isFollowing == true) Color(0xFF2A1A3E) else NeonPink
                        ),
                        border = if (isFollowing == true)
                            androidx.compose.foundation.BorderStroke(1.dp, TextTertiary.copy(alpha = 0.4f))
                        else null,
                        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 0.dp),
                        modifier = Modifier.height(28.dp),
                        shape = RoundedCornerShape(14.dp)
                    ) {
                        Text(
                            text = if (isFollowing == true) "Siguiendo" else "Seguir",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (isFollowing == true) TextTertiary else TextPrimary
                        )
                    }
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
            
            // ── Audio ──
            post.audioUrl?.let { audioUrl ->
                Spacer(modifier = Modifier.height(8.dp))
                PostAudioPlayer(audioUrl = audioUrl)
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

fun formatTimeAgo(dateStr: String): String {
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

fun formatCount(n: Int): String = when {
    n >= 1000000 -> "${(n / 1000000.0).let { "%.1f".format(it) }}M"
    n >= 1000 -> "${(n / 1000.0).let { "%.1f".format(it) }}k"
    else -> n.toString()
}

@Composable
fun PostAudioPlayer(audioUrl: String) {
    val context = LocalContext.current
    val exoPlayer = remember {
        androidx.media3.exoplayer.ExoPlayer.Builder(context).build().apply {
            setMediaItem(androidx.media3.common.MediaItem.fromUri(audioUrl))
            prepare()
        }
    }
    var isPlaying by remember { mutableStateOf(false) }

    DisposableEffect(Unit) {
        val listener = object : androidx.media3.common.Player.Listener {
            override fun onIsPlayingChanged(isPlayingState: Boolean) {
                isPlaying = isPlayingState
            }
        }
        exoPlayer.addListener(listener)
        onDispose {
            exoPlayer.removeListener(listener)
            exoPlayer.release()
        }
    }

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 12.dp)
            .clip(RoundedCornerShape(12.dp))
            .background(
                brush = Brush.linearGradient(listOf(NeonPurple, NeonPink))
            )
            .clickable {
                if (isPlaying) exoPlayer.pause() else exoPlayer.play()
            }
            .padding(12.dp),
        contentAlignment = Alignment.CenterStart
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .background(BgMain.copy(alpha = 0.5f), CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = if (isPlaying) Icons.Default.Pause else Icons.Default.PlayArrow,
                    contentDescription = "Play/Pause Audio",
                    tint = TextPrimary,
                    modifier = Modifier.size(20.dp)
                )
            }
            Spacer(modifier = Modifier.width(12.dp))
            Column {
                Text("Nota de Voz", fontWeight = FontWeight.Bold, color = TextPrimary, fontSize = 14.sp)
                Text(if (isPlaying) "Reproduciendo..." else "Toca para reproducir", color = TextPrimary.copy(alpha = 0.8f), fontSize = 12.sp)
            }
            Spacer(modifier = Modifier.weight(1f))
            // Minimal audio waves icon
            Icon(Icons.Default.GraphicEq, contentDescription = null, tint = TextPrimary.copy(alpha = 0.7f), modifier = Modifier.size(24.dp))
        }
    }
}
