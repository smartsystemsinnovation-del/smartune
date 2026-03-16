package com.smartune.app.ui.screens

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
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
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import com.smartune.app.navigation.Screen
import com.smartune.app.ui.theme.SmartuneColors

/**
 * Arcade Hub screen matching Figma frame for SmarTune Arcade.
 * Hosts all minigames: SmarTiles, Rhythm Quiz, Ear Training, etc.
 */
@Composable
fun ArcadeScreen(navController: NavHostController) {
    val games = listOf(
        GameItem("SmarTiles", "Toca las teclas al ritmo 🎹", Icons.Default.Piano, SmartuneColors.NeonCyan, Screen.SmarTiles.route),
        GameItem("Rhythm Quiz", "¿Puedes identificar el beat? 🥁", Icons.Default.Quiz, SmartuneColors.Accent, null),
        GameItem("Ear Training", "Entrena tu oído musical 👂", Icons.Default.Hearing, SmartuneColors.Gold, null),
        GameItem("Chord Master", "Domina los acordes 🎸", Icons.Default.MusicNote, SmartuneColors.Primary, null),
        GameItem("Tempo Runner", "Corre al tempo correcto 🏃", Icons.Default.Speed, Color(0xFF00FF88), null),
        GameItem("Note Catcher", "Atrapa las notas correctas ✨", Icons.Default.CatchingPokemon, SmartuneColors.PrimaryDark, null)
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(SmartuneColors.Background)
    ) {
        // ── Header ──
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            Color(0xFF1A0033),
                            SmartuneColors.Background
                        )
                    )
                )
                .padding(horizontal = 20.dp, vertical = 20.dp)
        ) {
            Text("SmarTune", color = Color.White, fontSize = 16.sp, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(16.dp))
            Text("Arcade", color = Color.White, fontSize = 34.sp, fontWeight = FontWeight.ExtraBold)
            Text("Minijuegos musicales", color = SmartuneColors.Primary, fontSize = 14.sp)
        }

        // ── Featured Game Banner ──
        Card(
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = Color.Transparent),
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 8.dp)
                .height(140.dp)
                .background(
                    Brush.horizontalGradient(
                        listOf(SmartuneColors.NeonCyan.copy(alpha = 0.2f), SmartuneColors.Primary.copy(alpha = 0.2f))
                    ),
                    RoundedCornerShape(20.dp)
                )
                .border(1.dp, SmartuneColors.NeonCyan.copy(alpha = 0.3f), RoundedCornerShape(20.dp))
                .clickable { navController.navigate(Screen.SmarTiles.route) }
        ) {
            Row(
                modifier = Modifier.padding(20.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text("⭐ DESTACADO", color = SmartuneColors.Gold, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text("SmarTiles", color = Color.White, fontSize = 24.sp, fontWeight = FontWeight.ExtraBold)
                    Text("Piano Rhythm Game", color = SmartuneColors.TextSecondary, fontSize = 13.sp)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("¡Jugar ahora!", color = SmartuneColors.NeonCyan, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                }
                Box(
                    modifier = Modifier
                        .size(60.dp)
                        .clip(CircleShape)
                        .background(SmartuneColors.NeonCyan.copy(alpha = 0.2f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(Icons.Default.Piano, null, tint = SmartuneColors.NeonCyan, modifier = Modifier.size(32.dp))
                }
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        // ── Games Grid ──
        Text(
            "Todos los Juegos",
            color = Color.White,
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(horizontal = 20.dp, vertical = 8.dp)
        )

        LazyVerticalGrid(
            columns = GridCells.Fixed(2),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
            modifier = Modifier.fillMaxSize()
        ) {
            items(games) { game ->
                GameCard(game) {
                    game.route?.let { navController.navigate(it) }
                }
            }
        }
    }
}

private data class GameItem(
    val title: String,
    val description: String,
    val icon: ImageVector,
    val color: Color,
    val route: String?
)

@Composable
private fun GameCard(game: GameItem, onClick: () -> Unit) {
    val isAvailable = game.route != null

    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (isAvailable) SmartuneColors.SurfaceCard else SmartuneColors.SurfaceCard.copy(alpha = 0.5f)
        ),
        modifier = Modifier
            .fillMaxWidth()
            .height(150.dp)
            .border(
                0.5.dp,
                if (isAvailable) game.color.copy(alpha = 0.3f) else SmartuneColors.Border,
                RoundedCornerShape(16.dp)
            )
            .clickable(enabled = isAvailable) { onClick() }
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(14.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .background(game.color.copy(alpha = 0.15f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(game.icon, null, tint = game.color, modifier = Modifier.size(22.dp))
            }

            Column {
                Text(
                    game.title,
                    color = if (isAvailable) Color.White else SmartuneColors.TextMuted,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    if (isAvailable) game.description else "Próximamente",
                    color = SmartuneColors.TextMuted,
                    fontSize = 11.sp,
                    maxLines = 2
                )
            }

            if (!isAvailable) {
                Text(
                    "🔒 PRONTO",
                    color = SmartuneColors.TextMuted,
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Bold,
                    textAlign = TextAlign.End,
                    modifier = Modifier.fillMaxWidth()
                )
            }
        }
    }
}
