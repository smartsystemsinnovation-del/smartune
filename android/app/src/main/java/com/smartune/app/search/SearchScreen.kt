package com.smartune.app.search

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.TrendingUp
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.smartune.app.core.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SearchScreen() {
    var query by remember { mutableStateOf("") }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(BgMain)
            .padding(24.dp)
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
            Text(
                "BUSCAR",
                color = TextTertiary,
                fontSize = 14.sp,
                letterSpacing = 2.sp,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(16.dp))

            // Search Bar (Neon Glassmorphism)
            OutlinedTextField(
                value = query,
                onValueChange = { query = it },
                placeholder = { Text("Artistas, canciones, cursos...", color = TextTertiary) },
                leadingIcon = {
                    Icon(Icons.Default.Search, contentDescription = "Search", tint = NeonCyan)
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(32.dp))
                    .background(BgCard),
                shape = RoundedCornerShape(32.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = NeonCyan,
                    unfocusedBorderColor = NeonCyan.copy(alpha = 0.3f),
                    focusedTextColor = TextPrimary,
                    unfocusedTextColor = TextPrimary,
                    cursorColor = NeonPink
                ),
                singleLine = true
            )

            Spacer(modifier = Modifier.height(32.dp))

            // Suggestions / Trending
            Text(
                "TENDENCIAS",
                color = TextPrimary,
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(16.dp))

            LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                items(5) { index ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(16.dp))
                            .background(BgCard)
                            .border(1.dp, NeonPink.copy(alpha = 0.1f), RoundedCornerShape(16.dp))
                            .padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.TrendingUp, contentDescription = "Trend", tint = NeonPink)
                        Spacer(modifier = Modifier.width(16.dp))
                        Column {
                            Text("Bajo Eléctrico Pro: Slap", color = TextPrimary, fontWeight = FontWeight.SemiBold)
                            Text("Curso interactivo", color = TextTertiary, fontSize = 12.sp)
                        }
                    }
                }
            }
        }
    }
}
