package com.smartune.app.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// Smartune Neon Color Palette
object SmartuneColors {
    val Background = Color(0xFF0F0F0F)
    val Surface = Color(0xFF1A1A1A)
    val SurfaceCard = Color(0xFF1F1F1F)
    val Primary = Color(0xFFD000FF)  // Neon Purple
    val PrimaryDark = Color(0xFF8000FF)
    val Accent = Color(0xFFF6339A) // Hot Pink
    val Gold = Color(0xFFFFD700)
    val TextPrimary = Color.White
    val TextSecondary = Color(0xFFB0B0B0)
    val TextMuted = Color(0xFF666666)
    val Border = Color(0x1AFFFFFF)
    val GlassCard = Color(0x0DFFFFFF)
}

private val DarkColorScheme = darkColorScheme(
    background = SmartuneColors.Background,
    surface = SmartuneColors.Surface,
    primary = SmartuneColors.Primary,
    secondary = SmartuneColors.PrimaryDark,
    tertiary = SmartuneColors.Accent,
    onBackground = SmartuneColors.TextPrimary,
    onSurface = SmartuneColors.TextPrimary,
    onPrimary = SmartuneColors.TextPrimary,
)

@Composable
fun SmartuneTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        content = content
    )
}
