package com.smartune.app.profile.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.GridItemSpan
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
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
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import coil.compose.AsyncImage
import com.smartune.app.core.supabase.SupabaseClient
import com.smartune.app.core.theme.*
import com.smartune.app.explorar.data.models.Post
import com.smartune.app.explorar.ui.PostCardItem
import com.smartune.app.profile.viewmodel.ProfileViewModel

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun PublicProfileScreen(
    userId: String,
    navController: NavController,
    viewModel: ProfileViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val authUserId = remember { SupabaseClient.auth.currentSessionOrNull()?.user?.id }
    val context = LocalContext.current

    LaunchedEffect(userId) {
        viewModel.loadProfile(userId)
    }

    // Loading state
    if (uiState.isLoading) {
        Box(
            modifier = Modifier.fillMaxSize().background(BgMain),
            contentAlignment = Alignment.Center
        ) {
            CircularProgressIndicator(color = NeonPink)
        }
        return
    }

    // Not found state
    val profile = uiState.profile
    if (profile == null) {
        Column(
            modifier = Modifier.fillMaxSize().background(BgMain),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text("Usuario no encontrado", color = TextTertiary, modifier = Modifier.padding(bottom = 16.dp))
            TextButton(onClick = { navController.popBackStack() }) {
                Text("← Volver", color = NeonPink, fontWeight = FontWeight.Bold)
            }
        }
        return
    }

    val avatarSrc = profile.avatarUrl
        ?: "https://ui-avatars.com/api/?background=2e1e42&color=fff&bold=true&size=150&name=${profile.nombre}"
    val totalLikes = uiState.posts.sumOf { it.likesCount }
    val displayPosts = if (uiState.activeTab == "grid") uiState.posts else uiState.likedPosts

    var selectedPost by remember { mutableStateOf<Post?>(null) }

    // ─── Main Grid (LazyVerticalGrid as root so header + grid scroll together) ───
    LazyVerticalGrid(
        columns = GridCells.Fixed(3),
        modifier = Modifier.fillMaxSize().background(BgMain),
        horizontalArrangement = Arrangement.spacedBy(2.dp),
        verticalArrangement = Arrangement.spacedBy(2.dp),
        contentPadding = PaddingValues(bottom = 80.dp)
    ) {

        // ── HEADER (full-width span) ──
        item(span = { GridItemSpan(maxLineSpan) }) {
            Column(modifier = Modifier.fillMaxWidth()) {

                // Banner
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(150.dp)
                        .background(
                            Brush.linearGradient(
                                listOf(Color(0xFF1a0b2e), Color(0xFF2d0a1f), Color(0xFF120518))
                            )
                        )
                ) {
                    IconButton(
                        onClick = { navController.popBackStack() },
                        modifier = Modifier.padding(top = 32.dp, start = 8.dp)
                    ) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Volver", tint = TextPrimary)
                    }
                }

                // Avatar + Info
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .offset(y = (-50).dp)
                        .padding(horizontal = 24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    // Avatar ring
                    Box(
                        modifier = Modifier
                            .size(110.dp)
                            .clip(CircleShape)
                            .background(Brush.linearGradient(listOf(NeonPink, NeonPurple, NeonPink)))
                            .padding(4.dp)
                            .clip(CircleShape)
                            .background(BgMain)
                    ) {
                        AsyncImage(
                            model = avatarSrc,
                            contentDescription = profile.nombre,
                            contentScale = ContentScale.Crop,
                            modifier = Modifier.fillMaxSize().clip(CircleShape)
                        )
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Text(
                        text = profile.nombre,
                        fontSize = 24.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = TextPrimary
                    )

                    val username = profile.nombre.lowercase().replace("\\s+".toRegex(), "")
                    Text(
                        text = "@$username • ${profile.rol.replaceFirstChar { it.uppercase() }}",
                        fontSize = 14.sp,
                        color = TextTertiary,
                        modifier = Modifier.padding(bottom = 16.dp)
                    )

                    // Stats row
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp),
                        horizontalArrangement = Arrangement.SpaceEvenly,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        StatItem(value = uiState.posts.size.toString(), label = "Posts")
                        VerticalDivider(
                            modifier = Modifier.height(30.dp),
                            color = TextTertiary.copy(alpha = 0.2f)
                        )
                        StatItem(value = uiState.followersCount.toString(), label = "Seguidores")
                        VerticalDivider(
                            modifier = Modifier.height(30.dp),
                            color = TextTertiary.copy(alpha = 0.2f)
                        )
                        StatItem(value = totalLikes.toString(), label = "Me gusta")
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    // Follow button (only if viewing someone else's profile)
                    if (authUserId != null && authUserId != userId) {
                        Button(
                            onClick = { viewModel.toggleFollow(userId) },
                            modifier = Modifier
                                .fillMaxWidth(0.8f)
                                .height(48.dp),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (uiState.isFollowing) BgCard else NeonPink
                            )
                        ) {
                            Text(
                                text = if (uiState.isFollowing) "Siguiendo" else "Seguir",
                                fontWeight = FontWeight.Bold,
                                color = TextPrimary
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Instrument
                    if (!profile.instrumento.isNullOrEmpty()) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(bottom = 8.dp)
                        ) {
                            Text("🎸", fontSize = 16.sp)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = profile.instrumento,
                                fontSize = 14.sp,
                                color = TextPrimary.copy(alpha = 0.8f)
                            )
                        }
                    }

                    // Music genre chips
                    if (!profile.gustosMusicales.isNullOrEmpty()) {
                        FlowRow(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.Center
                        ) {
                            profile.gustosMusicales.forEach { genre ->
                                Box(
                                    modifier = Modifier
                                        .padding(4.dp)
                                        .border(
                                            1.dp,
                                            TextTertiary.copy(alpha = 0.2f),
                                            RoundedCornerShape(16.dp)
                                        )
                                        .background(BgCard, RoundedCornerShape(16.dp))
                                        .padding(horizontal = 12.dp, vertical = 6.dp)
                                ) {
                                    Text(
                                        text = genre,
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = TextPrimary.copy(alpha = 0.7f)
                                    )
                                }
                            }
                        }
                    }
                } // end Avatar+Info Column

                // Tabs
                Row(modifier = Modifier.fillMaxWidth()) {
                    TabButton(
                        icon = Icons.Default.GridOn,
                        isSelected = uiState.activeTab == "grid",
                        onClick = { viewModel.setActiveTab("grid") },
                        modifier = Modifier.weight(1f)
                    )
                    TabButton(
                        icon = Icons.Default.FavoriteBorder,
                        isSelected = uiState.activeTab == "likes",
                        onClick = { viewModel.setActiveTab("likes") },
                        modifier = Modifier.weight(1f)
                    )
                }

                HorizontalDivider(color = TextTertiary.copy(alpha = 0.1f))

            } // end header Column
        } // end header item

        // ── EMPTY STATE (full-width span) ──
        if (displayPosts.isEmpty()) {
            item(span = { GridItemSpan(maxLineSpan) }) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(200.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(
                            imageVector = Icons.Default.PhotoLibrary,
                            contentDescription = null,
                            tint = TextTertiary,
                            modifier = Modifier.size(48.dp)
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = if (uiState.activeTab == "grid") "Aún no hay publicaciones"
                                   else "No hay likes todavía",
                            color = TextTertiary,
                            fontSize = 14.sp
                        )
                    }
                }
            }
        } else {
            // ── GRID ITEMS ──
            items(displayPosts) { post ->
                Box(
                    modifier = Modifier
                        .aspectRatio(1f)
                        .background(BgCard)
                        .clickable { selectedPost = post },
                    contentAlignment = Alignment.Center
                ) {
                    if (post.imageUrl != null) {
                        AsyncImage(
                            model = post.imageUrl,
                            contentDescription = null,
                            contentScale = ContentScale.Crop,
                            modifier = Modifier.fillMaxSize()
                        )
                    } else {
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .background(
                                    Brush.linearGradient(
                                        listOf(NeonPink.copy(alpha = 0.05f), NeonPurple.copy(alpha = 0.05f))
                                    )
                                )
                                .padding(8.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = post.content,
                                fontSize = 11.sp,
                                color = TextPrimary.copy(alpha = 0.8f),
                                maxLines = 4,
                                overflow = TextOverflow.Ellipsis
                            )
                        }
                    }
                }
            }
        }

    } // end LazyVerticalGrid

    // ── POST MODAL DIALOG ──
    if (selectedPost != null) {
        Dialog(
            onDismissRequest = { selectedPost = null },
            properties = DialogProperties(usePlatformDefaultWidth = false)
        ) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.Black.copy(alpha = 0.8f))
                    .clickable { selectedPost = null },
                contentAlignment = Alignment.Center
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp)
                        .clickable(enabled = false, onClick = {})
                ) {
                    PostCardItem(
                        post = selectedPost!!,
                        comments = emptyList(),
                        currentUserId = authUserId,
                        context = context,
                        onLike = {},
                        onLoadComments = {},
                        onAddComment = {},
                        onDelete = {},
                        onNavigateToProfile = {}
                    )

                    IconButton(
                        onClick = { selectedPost = null },
                        modifier = Modifier
                            .align(Alignment.TopEnd)
                            .offset(x = 12.dp, y = (-12).dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(32.dp)
                                .background(Color.Black.copy(alpha = 0.5f), CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.Close, contentDescription = "Cerrar", tint = Color.White)
                        }
                    }
                }
            }
        }
    }
}

// ── HELPERS ──

@Composable
fun StatItem(value: String, label: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(value, fontSize = 20.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
        Text(
            label,
            fontSize = 11.sp,
            color = TextTertiary,
            fontWeight = FontWeight.SemiBold,
            modifier = Modifier.padding(top = 2.dp)
        )
    }
}

@Composable
fun TabButton(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    isSelected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .fillMaxWidth()
            .clickable { onClick() }
            .padding(vertical = 12.dp),
        contentAlignment = Alignment.Center
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = if (isSelected) NeonPink else TextTertiary,
            modifier = Modifier.size(24.dp)
        )
        if (isSelected) {
            Box(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .offset(y = 12.dp)
                    .fillMaxWidth()
                    .height(2.dp)
                    .background(NeonPink)
            )
        }
    }
}
