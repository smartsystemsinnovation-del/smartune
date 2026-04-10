package com.smartune.app.gamification

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.smartune.app.core.theme.*

@Composable
fun GamificationScreen() {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(BgMain)
            .padding(24.dp)
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
            Text(
                "RANGO Y PROGRESO",
                color = TextTertiary,
                fontSize = 14.sp,
                letterSpacing = 2.sp,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(24.dp))

            // Current Rank Card
            Card(
                colors = CardDefaults.cardColors(containerColor = BgCard),
                shape = RoundedCornerShape(24.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .border(2.dp, NeonPink, RoundedCornerShape(24.dp))
            ) {
                Column(
                    modifier = Modifier.padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Box(
                        modifier = Modifier
                            .size(100.dp)
                            .clip(CircleShape)
                            .background(BgMain)
                            .border(3.dp, NeonCyan, CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("🎸", fontSize = 48.sp)
                    }
                    Spacer(modifier = Modifier.height(16.dp))
                    Text("Virtuoso I", color = TextPrimary, fontSize = 24.sp, fontWeight = FontWeight.Bold)
                    Text("Top 5% de bajistas esta semana", color = NeonCyan, fontSize = 14.sp)

                    Spacer(modifier = Modifier.height(24.dp))
                    LinearProgressIndicator(
                        progress = 0.75f,
                        modifier = Modifier.fillMaxWidth().height(12.dp).clip(RoundedCornerShape(6.dp)),
                        color = NeonPink,
                        trackColor = BgMain
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("7,500 XP", color = TextSecondary, fontSize = 12.sp)
                        Text("10,000 XP", color = TextTertiary, fontSize = 12.sp)
                    }
                }
            }

            Spacer(modifier = Modifier.height(32.dp))
            Text("LOGROS", color = TextPrimary, fontWeight = FontWeight.Bold, fontSize = 18.sp)
            Spacer(modifier = Modifier.height(16.dp))

            LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                items(3) { index ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(16.dp))
                            .background(BgCard)
                            .border(1.dp, NeonCyan.copy(alpha = 0.2f), RoundedCornerShape(16.dp))
                            .padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(48.dp)
                                .clip(CircleShape)
                                .background(NeonPink.copy(alpha = 0.1f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.Star, contentDescription = "Star", tint = NeonPink)
                        }
                        Spacer(modifier = Modifier.width(16.dp))
                        Column {
                            Text("Combo x10 Días", color = TextPrimary, fontWeight = FontWeight.SemiBold)
                            Text("Estudia todos los días", color = TextTertiary, fontSize = 12.sp)
                        }
                        Spacer(modifier = Modifier.weight(1f))
                        Text("+500", color = NeonCyan, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}
