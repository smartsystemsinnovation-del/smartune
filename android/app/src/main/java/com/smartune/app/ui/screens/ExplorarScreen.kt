package com.smartune.app.ui.screens

import androidx.compose.foundation.*
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.smartune.app.ui.theme.SmartuneColors

/**
 * Discover/Descubre screen matching Figma frame 131:987.
 * Community feed with posts, audio snippets, polls, and music news.
 */
@Composable
fun ExplorarScreen() {
    val posts = remember {
        listOf(
            CommunityPost(
                username = "@synthwave_hero",
                subtitle = "20h ago",
                avatar = "https://images.unsplash.com/photo-1535930749574-1399327ce78f?w=100",
                text = "Exploring new synth textures tonight using the SmarTune AI pedal. Check out this snippet from the upcoming track! 🎹✨",
                snippet = SnippetData("Midnight Neon (Intro)"),
                likes = 124,
                comments = 12,
                reposts = 5,
                shares = 8
            ),
            CommunityPost(
                username = "@beat_maker",
                subtitle = "Community Post",
                avatar = "https://images.unsplash.com/photo-1534126416832-a88fdf2911c2?w=100",
                text = "Just finished this Lo-fi beat. What do you think of the kick? 🎧",
                audioFile = "Kick_Test_v2.mp3",
                likes = 36,
                comments = 4,
                reposts = 0,
                shares = 0
            ),
            CommunityPost(
                username = "MUSIC NEWS",
                subtitle = "2h",
                avatar = null,
                text = "",
                isNews = true,
                newsTitle = "Grammy Awards 2024 Nominees Announced",
                newsSubtitle = "Check out the full list and see if your favorites made the cut...",
                likes = 0,
                comments = 0,
                reposts = 0,
                shares = 0
            ),
            CommunityPost(
                username = "@bass_dropper",
                subtitle = "Poll",
                avatar = "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100",
                text = "Which genre should I tackle next for the masterclass?",
                poll = PollData(
                    options = listOf("Deep House" to 65, "Tech Trance" to 35),
                    totalVotes = 842,
                    daysLeft = 2
                ),
                likes = 0,
                comments = 0,
                reposts = 0,
                shares = 0
            )
        )
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(SmartuneColors.Background),
        contentPadding = PaddingValues(bottom = 100.dp)
    ) {
        // ── Top bar ──
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("SmarTune", color = Color.White, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                Row {
                    IconButton(onClick = {}) {
                        Icon(Icons.Default.Notifications, null, tint = Color.White)
                    }
                    Box(
                        modifier = Modifier
                            .size(32.dp)
                            .clip(CircleShape)
                            .background(SmartuneColors.Gold),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.Star, null, tint = Color.Black, modifier = Modifier.size(16.dp))
                    }
                }
            }
        }

        // ── Title ──
        item {
            Text(
                "Descubre",
                color = SmartuneColors.Primary,
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(horizontal = 20.dp, vertical = 8.dp)
            )
        }

        // ── Feed Posts ──
        items(posts) { post ->
            if (post.isNews) {
                NewsCard(post)
            } else {
                FeedPostCard(post)
            }
            Spacer(modifier = Modifier.height(12.dp))
        }
    }
}

// ── Data classes ──
private data class SnippetData(val title: String)
private data class PollData(val options: List<Pair<String, Int>>, val totalVotes: Int, val daysLeft: Int)
private data class CommunityPost(
    val username: String,
    val subtitle: String,
    val avatar: String?,
    val text: String,
    val snippet: SnippetData? = null,
    val audioFile: String? = null,
    val poll: PollData? = null,
    val isNews: Boolean = false,
    val newsTitle: String? = null,
    val newsSubtitle: String? = null,
    val likes: Int,
    val comments: Int,
    val reposts: Int,
    val shares: Int
)

// ── Feed Post Card ──
@Composable
private fun FeedPostCard(post: CommunityPost) {
    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = SmartuneColors.SurfaceCard),
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            // Header
            Row(verticalAlignment = Alignment.CenterVertically) {
                if (post.avatar != null) {
                    AsyncImage(
                        model = post.avatar,
                        contentDescription = null,
                        modifier = Modifier.size(40.dp).clip(CircleShape),
                        contentScale = ContentScale.Crop
                    )
                } else {
                    Box(
                        modifier = Modifier.size(40.dp).clip(CircleShape).background(SmartuneColors.Primary),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(post.username.take(1), color = Color.White, fontWeight = FontWeight.Bold)
                    }
                }
                Spacer(modifier = Modifier.width(12.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Text(post.username, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                    Text(post.subtitle, color = SmartuneColors.TextMuted, fontSize = 12.sp)
                }
                Icon(Icons.Default.MoreHoriz, null, tint = SmartuneColors.TextMuted)
            }

            if (post.text.isNotBlank()) {
                Spacer(modifier = Modifier.height(12.dp))
                Text(post.text, color = Color.White, fontSize = 14.sp, lineHeight = 20.sp)
            }

            // Snippet card
            post.snippet?.let { snippet ->
                Spacer(modifier = Modifier.height(12.dp))
                Card(
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = Color(0xFF2A1540)
                    )
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .clip(CircleShape)
                                .background(SmartuneColors.Primary),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.PlayArrow, null, tint = Color.White, modifier = Modifier.size(20.dp))
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text("SNIPPET", color = SmartuneColors.Primary, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                            Text(snippet.title, color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Medium)
                        }
                    }
                }
            }

            // Audio file
            post.audioFile?.let { file ->
                Spacer(modifier = Modifier.height(12.dp))
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(SmartuneColors.Surface, RoundedCornerShape(10.dp))
                        .padding(12.dp)
                ) {
                    Icon(Icons.Default.MusicNote, null, tint = SmartuneColors.Primary, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(10.dp))
                    Text(file, color = Color.White, fontSize = 13.sp, modifier = Modifier.weight(1f))
                    Icon(Icons.Default.Download, null, tint = SmartuneColors.TextSecondary, modifier = Modifier.size(20.dp))
                }
            }

            // Poll
            post.poll?.let { poll ->
                Spacer(modifier = Modifier.height(12.dp))
                poll.options.forEach { (option, percent) ->
                    Spacer(modifier = Modifier.height(6.dp))
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(40.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .background(SmartuneColors.Surface)
                    ) {
                        Box(
                            modifier = Modifier
                                .fillMaxHeight()
                                .fillMaxWidth(percent / 100f)
                                .background(SmartuneColors.Primary.copy(alpha = 0.3f))
                        )
                        Row(
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(horizontal = 14.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(option, color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Medium)
                            Text("$percent%", color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    "${poll.totalVotes} votes · ${poll.daysLeft} days left",
                    color = SmartuneColors.TextMuted,
                    fontSize = 11.sp
                )
            }

            // Interaction bar (for non-poll, non-news posts)
            if (post.likes > 0 || post.comments > 0) {
                Spacer(modifier = Modifier.height(12.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(20.dp)
                ) {
                    InteractionChip(Icons.Default.ChatBubbleOutline, post.comments.toString())
                    InteractionChip(Icons.Default.Repeat, post.reposts.toString())
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Favorite, null, tint = SmartuneColors.Accent, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(post.likes.toString(), color = SmartuneColors.Accent, fontSize = 12.sp)
                    }
                    InteractionChip(Icons.Default.Share, post.shares.toString())
                }
            }
        }
    }
}

// ── News Card ──
@Composable
private fun NewsCard(post: CommunityPost) {
    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF1A0A2E)),
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp)
            .border(1.dp, SmartuneColors.Primary.copy(alpha = 0.3f), RoundedCornerShape(16.dp))
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(32.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(SmartuneColors.Primary),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(Icons.Default.Newspaper, null, tint = Color.White, modifier = Modifier.size(18.dp))
                }
                Spacer(modifier = Modifier.width(10.dp))
                Text("MUSIC NEWS", color = SmartuneColors.Primary, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.weight(1f))
                Text(post.subtitle, color = SmartuneColors.TextMuted, fontSize = 11.sp)
            }
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                post.newsTitle ?: "",
                color = Color.White,
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                post.newsSubtitle ?: "",
                color = SmartuneColors.TextSecondary,
                fontSize = 13.sp,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )
        }
    }
}

// ── Interaction Chip ──
@Composable
private fun InteractionChip(icon: androidx.compose.ui.graphics.vector.ImageVector, count: String) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Icon(icon, null, tint = SmartuneColors.TextMuted, modifier = Modifier.size(16.dp))
        Spacer(modifier = Modifier.width(4.dp))
        Text(count, color = SmartuneColors.TextMuted, fontSize = 12.sp)
    }
}
