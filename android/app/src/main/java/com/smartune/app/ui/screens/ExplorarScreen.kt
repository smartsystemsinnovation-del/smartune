package com.smartune.app.ui.screens

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.smartune.app.ui.theme.SmartuneColors

@Composable
fun ExplorarScreen() {
    val categorias = listOf(
        "🎹 Piano Classic", "🌊 Synthwave", "🎷 Jazz Impro",
        "📚 Lo-Fi Study", "🎸 Metal Shred", "🎧 Techno",
        "🎤 K-Pop", "🔊 Phonk", "🎻 Soundtracks"
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(SmartuneColors.Background)
            .padding(horizontal = 24.dp)
    ) {
        Spacer(modifier = Modifier.height(16.dp))
        Text("Explorar", color = Color.White, fontSize = 34.sp, fontWeight = FontWeight.ExtraBold)
        Text("Nuevos Desafíos", color = SmartuneColors.Primary, fontSize = 14.sp)
        Spacer(modifier = Modifier.height(24.dp))

        LazyVerticalGrid(
            columns = GridCells.Fixed(2),
            horizontalArrangement = Arrangement.spacedBy(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            items(categorias) { cat ->
                Box(
                    modifier = Modifier
                        .height(120.dp)
                        .clip(RoundedCornerShape(20.dp))
                        .background(SmartuneColors.GlassCard)
                        .border(0.5.dp, SmartuneColors.Border, RoundedCornerShape(20.dp))
                        .clickable { },
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = cat,
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                        textAlign = TextAlign.Center,
                        fontSize = 14.sp
                    )
                }
            }
        }
    }
}
