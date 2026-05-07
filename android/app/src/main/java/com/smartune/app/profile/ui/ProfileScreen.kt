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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import coil.compose.AsyncImage
import com.smartune.app.core.navigation.Routes
import com.smartune.app.core.supabase.SupabaseClient
import com.smartune.app.core.theme.*
import com.smartune.app.explorar.data.models.Post
import com.smartune.app.explorar.data.models.UserProfile
import com.smartune.app.explorar.data.repository.SocialRepository
import com.smartune.app.explorar.ui.PostAudioPlayer
import kotlinx.coroutines.launch
import androidx.compose.material.ExperimentalMaterialApi
import androidx.compose.material.pullrefresh.PullRefreshIndicator
import androidx.compose.material.pullrefresh.pullRefresh
import androidx.compose.material.pullrefresh.rememberPullRefreshState

@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class, ExperimentalMaterialApi::class)
@Composable
fun ProfileScreen(navController: NavController, onLogout: () -> Unit) {
    val scope = rememberCoroutineScope()
    val repo = remember { SocialRepository() }
    var profile by remember { mutableStateOf<UserProfile?>(null) }
    var posts by remember { mutableStateOf<List<Post>>(emptyList()) }
    var followersCount by remember { mutableStateOf(0) }
    var isLoading by remember { mutableStateOf(true) }
    var isRefreshing by remember { mutableStateOf(false) }
    var activeTab by remember { mutableStateOf("grid") }
    var showSettings by remember { mutableStateOf(false) }
    val context = LocalContext.current

    val authUserId = remember { SupabaseClient.auth.currentSessionOrNull()?.user?.id }

    suspend fun loadData() {
        if (authUserId != null) {
            profile = repo.getUserProfile(authUserId)
            posts = repo.getUserPosts(authUserId)
            followersCount = repo.getFollowersCount(authUserId)
        }
    }

    LaunchedEffect(Unit) {
        isLoading = true
        loadData()
        isLoading = false
    }

    if (isLoading) {
        Box(Modifier.fillMaxSize().background(BgMain), Alignment.Center) {
            CircularProgressIndicator(color = NeonPink)
        }
        return
    }

    val p = profile ?: return
    val avatarSrc = p.avatarUrl
        ?: "https://ui-avatars.com/api/?background=2e1e42&color=fff&bold=true&size=150&name=${p.nombre}"
    val totalLikes = posts.sumOf { it.likesCount }

    // Settings Bottom Sheet
    if (showSettings) {
        SettingsSheet(
            profile = p,
            navController = navController,
            onDismiss = { showSettings = false },
            onSave = { newName, newInstrumento, newGeneros ->
                scope.launch {
                    repo.updateProfile(newName, newInstrumento, newGeneros)
                    profile = repo.getUserProfile(authUserId ?: return@launch)
                    showSettings = false
                }
            },
            onLogout = {
                scope.launch {
                    try { SupabaseClient.auth.signOut() } catch (_: Exception) {}
                    onLogout()
                }
            }
        )
    }

    val pullRefreshState = rememberPullRefreshState(
        refreshing = isRefreshing,
        onRefresh = {
            scope.launch {
                isRefreshing = true
                loadData()
                isRefreshing = false
            }
        }
    )

    Box(
        modifier = Modifier.fillMaxSize().background(BgMain).pullRefresh(pullRefreshState)
    ) {

    LazyVerticalGrid(
        columns = GridCells.Fixed(3),
        modifier = Modifier.fillMaxSize().background(BgMain),
        horizontalArrangement = Arrangement.spacedBy(2.dp),
        verticalArrangement = Arrangement.spacedBy(2.dp),
        contentPadding = PaddingValues(bottom = 80.dp)
    ) {

        // ── HEADER ──
        item(span = { GridItemSpan(maxLineSpan) }) {
            Column(modifier = Modifier.fillMaxWidth()) {

                // Banner gradient
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(140.dp)
                        .background(
                            Brush.linearGradient(
                                listOf(Color(0xFF1a0b2e), Color(0xFF2d0a1f), Color(0xFF120518))
                            )
                        )
                )

                // Avatar + Info
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .offset(y = (-50).dp)
                        .padding(horizontal = 24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
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
                            contentDescription = p.nombre,
                            contentScale = ContentScale.Crop,
                            modifier = Modifier.fillMaxSize().clip(CircleShape)
                        )
                    }

                    Spacer(Modifier.height(12.dp))

                    // Name + gear icon
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = p.nombre,
                            fontSize = 24.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = TextPrimary
                        )
                        Spacer(Modifier.width(8.dp))
                        IconButton(
                            onClick = { showSettings = true },
                            modifier = Modifier.size(32.dp)
                        ) {
                            Icon(
                                Icons.Default.Settings,
                                contentDescription = "Ajustes",
                                tint = TextTertiary,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                    }

                    val isProfesor = p.profesorAprobado || p.rol == "profesor"
                    val rolLabel = if (isProfesor) "Profesor Verificado ✓" else "Estudiante"
                    val rolColor = if (isProfesor) NeonCyan else NeonPink
                    Text(
                        text = "@${p.nombre.lowercase().replace("\\s+".toRegex(), "")} • $rolLabel",
                        fontSize = 13.sp,
                        color = rolColor,
                        modifier = Modifier.padding(bottom = 16.dp)
                    )

                    // Stats
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
                        horizontalArrangement = Arrangement.SpaceEvenly,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        ProfileStatItem(posts.size.toString(), "Posts")
                        VerticalDivider(Modifier.height(30.dp), color = TextTertiary.copy(0.2f))
                        ProfileStatItem(followersCount.toString(), "Seguidores")
                        VerticalDivider(Modifier.height(30.dp), color = TextTertiary.copy(0.2f))
                        ProfileStatItem(totalLikes.toString(), "Me gusta")
                    }

                    Spacer(Modifier.height(16.dp))

                    // Instrument
                    if (!p.instrumento.isNullOrEmpty()) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text("🎸", fontSize = 16.sp)
                            Spacer(Modifier.width(8.dp))
                            Text(p.instrumento, fontSize = 14.sp, color = TextPrimary.copy(0.8f))
                        }
                        Spacer(Modifier.height(8.dp))
                    }

                    // Genre chips
                    if (!p.gustosMusicales.isNullOrEmpty()) {
                        FlowRow(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.Center
                        ) {
                            p.gustosMusicales.forEach { genre ->
                                SuggestionChip(
                                    onClick = {},
                                    label = { Text(genre, fontSize = 12.sp) },
                                    modifier = Modifier.padding(horizontal = 3.dp, vertical = 2.dp),
                                    colors = SuggestionChipDefaults.suggestionChipColors(
                                        containerColor = NeonPurple.copy(0.15f),
                                        labelColor = NeonPurple
                                    ),
                                    border = SuggestionChipDefaults.suggestionChipBorder(
                                        enabled = true,
                                        borderColor = NeonPurple.copy(0.3f)
                                    )
                                )
                            }
                        }
                        Spacer(Modifier.height(8.dp))
                    }
                }

                // Tab selector
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(BgCard)
                        .padding(vertical = 4.dp),
                    horizontalArrangement = Arrangement.SpaceEvenly
                ) {
                    TabIcon(Icons.Default.GridView, activeTab == "grid") { activeTab = "grid" }
                    TabIcon(Icons.Default.ViewStream, activeTab == "list") { activeTab = "list" }
                }
            }
        }

        // ── LIST TAB ──
        if (activeTab == "list") {
            item(span = { GridItemSpan(maxLineSpan) }) {
                Column {
                    posts.forEach { post ->
                        PostListCard(post = post)
                        Spacer(Modifier.height(8.dp))
                    }
                    if (posts.isEmpty()) {
                        Box(
                            modifier = Modifier.fillMaxWidth().padding(48.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("Sin publicaciones aún", color = TextTertiary)
                        }
                    }
                }
            }
        }

        // ── GRID TAB ──
        if (activeTab == "grid") {
            if (posts.isEmpty()) {
                item(span = { GridItemSpan(maxLineSpan) }) {
                    Box(Modifier.fillMaxWidth().padding(48.dp), Alignment.Center) {
                        Text("Sin publicaciones aún", color = TextTertiary)
                    }
                }
            } else {
                items(posts, key = { it.id }) { post ->
                    val thumb = post.imageUrl ?: post.audioUrl
                    Box(
                        modifier = Modifier
                            .aspectRatio(1f)
                            .background(BgCard)
                    ) {
                        if (post.imageUrl != null) {
                            AsyncImage(
                                model = post.imageUrl,
                                contentDescription = null,
                                contentScale = ContentScale.Crop,
                                modifier = Modifier.fillMaxSize()
                            )
                        } else if (post.audioUrl != null) {
                            Box(
                                modifier = Modifier.fillMaxSize()
                                    .background(Brush.linearGradient(listOf(NeonPurple.copy(0.3f), NeonPink.copy(0.3f)))),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(Icons.Default.MusicNote, contentDescription = null, tint = NeonPurple, modifier = Modifier.size(32.dp))
                            }
                        } else {
                            Box(
                                modifier = Modifier.fillMaxSize().background(BgCard.copy(alpha = 0.8f)),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(post.content.take(40), color = TextPrimary.copy(0.7f), fontSize = 10.sp, modifier = Modifier.padding(4.dp))
                            }
                        }
                    }
                }
            }
        }
    }

        PullRefreshIndicator(
            refreshing = isRefreshing,
            state = pullRefreshState,
            modifier = Modifier.align(Alignment.TopCenter),
            backgroundColor = BgCard,
            contentColor = NeonPink
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
private fun SettingsSheet(
    profile: UserProfile,
    navController: NavController,
    onDismiss: () -> Unit,
    onSave: (String, String?, List<String>?) -> Unit,
    onLogout: () -> Unit
) {
    var editName by remember { mutableStateOf(profile.nombre) }
    var editInstrumento by remember { mutableStateOf(profile.instrumento ?: "Ninguno") }
    var editGeneros by remember { mutableStateOf(profile.gustosMusicales ?: emptyList()) }
    var isSaving by remember { mutableStateOf(false) }
    var showInstrumentDropdown by remember { mutableStateOf(false) }

    val instruments = listOf("Guitarra", "Batería", "Piano", "Bajo", "Voz", "Sintetizador", "Ninguno", "Otro")
    val allGenres = listOf("Hardstyle", "Phonk", "Rock", "Pop", "Electrónica", "Videojuegos", "Metal", "Trap", "Lo-fi")
    val isProfesor = profile.profesorAprobado || profile.rol == "profesor"
    val instrumentLabel = if (isProfesor) "Instrumento Principal (Enseñar)" else "Instrumento de Práctica"
    val avatarSrc = profile.avatarUrl
        ?: "https://ui-avatars.com/api/?background=2e1e42&color=fff&bold=true&size=150&name=${profile.nombre}"

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        containerColor = Color(0xFF130d1f),
        shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp)
    ) {
        androidx.compose.foundation.lazy.LazyColumn(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 24.dp)
                .padding(bottom = 32.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Avatar
            item {
                AsyncImage(
                    model = avatarSrc,
                    contentDescription = null,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.size(72.dp).clip(CircleShape)
                        .border(2.dp, Brush.linearGradient(listOf(NeonPink, NeonPurple)), CircleShape)
                )
                Spacer(Modifier.height(12.dp))
                Text("AJUSTES", fontSize = 18.sp, fontWeight = FontWeight.ExtraBold, color = TextPrimary, letterSpacing = 2.sp)
                Text("Cuenta de Google vinculada", fontSize = 12.sp, color = TextTertiary)
                Spacer(Modifier.height(24.dp))
            }

            // Name field
            item {
                OutlinedTextField(
                    value = editName,
                    onValueChange = { editName = it },
                    label = { Text("Nombre") },
                    leadingIcon = { Icon(Icons.Default.Person, null, tint = TextTertiary) },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = NeonPink,
                        unfocusedBorderColor = TextTertiary.copy(0.3f),
                        focusedTextColor = TextPrimary,
                        unfocusedTextColor = TextPrimary,
                        cursorColor = NeonPink,
                        focusedContainerColor = Color(0xFF1e1530),
                        unfocusedContainerColor = Color(0xFF1e1530),
                        focusedLabelColor = NeonPink,
                        unfocusedLabelColor = TextTertiary
                    )
                )
                Spacer(Modifier.height(12.dp))
            }

            // Email (read-only)
            item {
                OutlinedTextField(
                    value = profile.email,
                    onValueChange = {},
                    label = { Text("Correo") },
                    leadingIcon = { Icon(Icons.Default.Email, null, tint = TextTertiary) },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    enabled = false,
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        disabledBorderColor = TextTertiary.copy(0.15f),
                        disabledTextColor = TextTertiary,
                        disabledContainerColor = Color(0xFF1a1227),
                        disabledLabelColor = TextTertiary.copy(0.5f),
                        disabledLeadingIconColor = TextTertiary.copy(0.4f)
                    )
                )
                Spacer(Modifier.height(20.dp))
            }

            // Instrument dropdown
            item {
                Text(
                    instrumentLabel.uppercase(),
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextTertiary,
                    letterSpacing = 1.sp,
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(Modifier.height(8.dp))
                ExposedDropdownMenuBox(
                    expanded = showInstrumentDropdown,
                    onExpandedChange = { showInstrumentDropdown = it },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    OutlinedTextField(
                        value = editInstrumento,
                        onValueChange = {},
                        readOnly = true,
                        modifier = Modifier.fillMaxWidth().menuAnchor(),
                        shape = RoundedCornerShape(12.dp),
                        leadingIcon = { Icon(Icons.Default.MusicNote, null, tint = NeonPurple) },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = showInstrumentDropdown) },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = NeonPurple,
                            unfocusedBorderColor = NeonPurple.copy(0.3f),
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary,
                            focusedContainerColor = Color(0xFF1e1530),
                            unfocusedContainerColor = Color(0xFF1e1530)
                        )
                    )
                    ExposedDropdownMenu(
                        expanded = showInstrumentDropdown,
                        onDismissRequest = { showInstrumentDropdown = false },
                        modifier = Modifier.background(Color(0xFF1e1530))
                    ) {
                        instruments.forEach { inst ->
                            DropdownMenuItem(
                                text = { Text(inst, color = TextPrimary) },
                                onClick = {
                                    editInstrumento = inst
                                    showInstrumentDropdown = false
                                },
                                leadingIcon = if (inst == editInstrumento) {
                                    { Icon(Icons.Default.Check, null, tint = NeonPurple, modifier = Modifier.size(16.dp)) }
                                } else null
                            )
                        }
                    }
                }
                Spacer(Modifier.height(20.dp))
            }

            // Genre chips
            item {
                Text(
                    "GÉNEROS FAVORITOS",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextTertiary,
                    letterSpacing = 1.sp,
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(Modifier.height(8.dp))
                FlowRow(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.Start
                ) {
                    allGenres.forEach { genre ->
                        val selected = genre in editGeneros
                        FilterChip(
                            selected = selected,
                            onClick = {
                                editGeneros = if (selected) editGeneros - genre else editGeneros + genre
                            },
                            label = { Text(genre, fontSize = 13.sp) },
                            modifier = Modifier.padding(end = 6.dp, bottom = 6.dp),
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = NeonPurple.copy(0.25f),
                                selectedLabelColor = NeonPurple,
                                containerColor = Color(0xFF1e1530),
                                labelColor = TextTertiary
                            ),
                            border = FilterChipDefaults.filterChipBorder(
                                enabled = true,
                                selected = selected,
                                selectedBorderColor = NeonPurple.copy(0.6f),
                                borderColor = TextTertiary.copy(0.2f)
                            )
                        )
                    }
                }
                Spacer(Modifier.height(24.dp))
            }

            // Save button
            item {
                Button(
                    onClick = {
                        isSaving = true
                        onSave(editName, editInstrumento.takeIf { it != "Ninguno" }, editGeneros.toList())
                    },
                    modifier = Modifier.fillMaxWidth().height(52.dp),
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = NeonPink),
                    enabled = !isSaving && editName.isNotBlank()
                ) {
                    if (isSaving) {
                        CircularProgressIndicator(color = TextPrimary, modifier = Modifier.size(20.dp), strokeWidth = 2.dp)
                    } else {
                        Text("GUARDAR CAMBIOS", fontWeight = FontWeight.ExtraBold, letterSpacing = 1.sp)
                    }
                }
                Spacer(Modifier.height(8.dp))
                HorizontalDivider(color = TextTertiary.copy(0.1f), modifier = Modifier.padding(vertical = 8.dp))
            }

            // Extra options
            item {
                if (profile.profesorAprobado) {
                    SettingsOption(icon = Icons.Default.Dashboard, label = "Panel de Profesor", tint = NeonCyan) {
                        navController.navigate(Routes.TEACHER_DASHBOARD)
                        onDismiss()
                    }
                }
                SettingsOption(icon = Icons.Default.Star, label = "Premium", tint = NeonPink) {
                    navController.navigate(Routes.PREMIUM)
                    onDismiss()
                }
                HorizontalDivider(color = TextTertiary.copy(0.1f), modifier = Modifier.padding(vertical = 8.dp))
                SettingsOption(icon = Icons.Default.Logout, label = "Cerrar sesión", tint = Color(0xFFFF4F4F)) {
                    onLogout()
                }
                Spacer(Modifier.height(8.dp))
            }
        }
    }
}


@Composable
private fun SettingsOption(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    label: String,
    tint: Color,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
            .padding(vertical = 14.dp, horizontal = 4.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(icon, contentDescription = null, tint = tint, modifier = Modifier.size(22.dp))
        Spacer(Modifier.width(14.dp))
        Text(label, fontSize = 15.sp, color = TextPrimary, fontWeight = FontWeight.Medium, modifier = Modifier.weight(1f))
        Icon(Icons.Default.ChevronRight, null, tint = TextTertiary.copy(0.5f), modifier = Modifier.size(18.dp))
    }
}

@Composable
private fun ProfileStatItem(value: String, label: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(value, fontWeight = FontWeight.ExtraBold, fontSize = 20.sp, color = TextPrimary)
        Text(label, fontSize = 12.sp, color = TextTertiary)
    }
}

@Composable
private fun TabIcon(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    selected: Boolean,
    onClick: () -> Unit
) {
    IconButton(onClick = onClick) {
        Icon(
            icon,
            contentDescription = null,
            tint = if (selected) NeonPink else TextTertiary,
            modifier = Modifier.size(24.dp)
        )
    }
}

@Composable
private fun PostListCard(post: Post) {
    Card(
        modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF1a1230))
    ) {
        Column(Modifier.padding(12.dp)) {
            if (post.content.isNotBlank()) {
                Text(post.content, fontSize = 14.sp, color = TextPrimary)
                Spacer(Modifier.height(8.dp))
            }
            post.imageUrl?.let { url ->
                AsyncImage(
                    model = url,
                    contentDescription = null,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxWidth().heightIn(max = 200.dp).clip(RoundedCornerShape(8.dp))
                )
                Spacer(Modifier.height(8.dp))
            }
            post.audioUrl?.let { url ->
                PostAudioPlayer(audioUrl = url)
                Spacer(Modifier.height(8.dp))
            }
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.FavoriteBorder, null, tint = TextTertiary, modifier = Modifier.size(14.dp))
                Spacer(Modifier.width(4.dp))
                Text("${post.likesCount}", fontSize = 12.sp, color = TextTertiary)
                Spacer(Modifier.width(12.dp))
                Icon(Icons.Default.ChatBubbleOutline, null, tint = TextTertiary, modifier = Modifier.size(14.dp))
                Spacer(Modifier.width(4.dp))
                Text("${post.commentsCount}", fontSize = 12.sp, color = TextTertiary)
            }
        }
    }
}
