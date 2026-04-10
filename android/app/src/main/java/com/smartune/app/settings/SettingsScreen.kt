package com.smartune.app.settings

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
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
fun SettingsScreen(onNavigateBack: () -> Unit) {
    var pushNotifications by remember { mutableStateOf(true) }
    var offlineMode by remember { mutableStateOf(false) }

    Box(modifier = Modifier.fillMaxSize().background(BgMain).padding(24.dp)) {
        Column {
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = onNavigateBack) {
                    Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = TextPrimary)
                }
                Text("AJUSTES", color = TextTertiary, fontWeight = FontWeight.Bold, letterSpacing = 2.sp, fontSize = 14.sp)
            }
            
            Spacer(modifier = Modifier.height(32.dp))
            
            Card(
                colors = CardDefaults.cardColors(containerColor = BgCard),
                shape = RoundedCornerShape(24.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, NeonPink.copy(alpha = 0.2f), RoundedCornerShape(24.dp))
            ) {
                Column(modifier = Modifier.padding(24.dp)) {
                    Text("Preferencias", color = NeonCyan, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                        Text("Notificaciones Push", color = TextPrimary, fontSize = 16.sp)
                        Switch(
                            checked = pushNotifications,
                            onCheckedChange = { pushNotifications = it },
                            colors = SwitchDefaults.colors(checkedThumbColor = BgMain, checkedTrackColor = NeonPink, uncheckedTrackColor = TextTertiary)
                        )
                    }
                    Spacer(modifier = Modifier.height(16.dp))
                    HorizontalDivider(color = TextTertiary.copy(alpha = 0.1f))
                    Spacer(modifier = Modifier.height(16.dp))
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                        Text("Modo Offline (Descargas)", color = TextPrimary, fontSize = 16.sp)
                        Switch(
                            checked = offlineMode,
                            onCheckedChange = { offlineMode = it },
                            colors = SwitchDefaults.colors(checkedThumbColor = BgMain, checkedTrackColor = NeonCyan, uncheckedTrackColor = TextTertiary)
                        )
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(24.dp))
            
            Button(
                onClick = { /* TODO Support */ },
                modifier = Modifier.fillMaxWidth().height(56.dp),
                colors = ButtonDefaults.buttonColors(containerColor = BgCard),
                shape = RoundedCornerShape(16.dp)
            ) {
                Text("Centro de Ayuda", color = TextPrimary)
            }
        }
    }
}
