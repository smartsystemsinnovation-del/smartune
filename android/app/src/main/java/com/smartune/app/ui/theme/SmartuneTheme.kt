package com.smartune.app.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color

// Smartune Neon Color Palette — Extracted from Figma + Web
object SmartuneColors {
    // Backgrounds
    val Background      = Color(0xFF0A0A0F)
    val Surface         = Color(0xFF1A1A2E)
    val SurfaceCard     = Color(0xFF16162A)
    val InputBackground = Color(0xFF1E1E30)

    // Neon accents
    val Primary     = Color(0xFFD000FF)   // Magenta Neón
    val PrimaryDark = Color(0xFF8000FF)   // Púrpura profundo
    val Accent      = Color(0xFFF6339A)   // Hot Pink
    val NeonCyan    = Color(0xFF00F0FF)   // Cyan (SmarTiles)
    val Gold        = Color(0xFFFFD700)   // Premium badge

    // Texts
    val TextPrimary   = Color.White
    val TextSecondary = Color(0xFFB0B0B0)
    val TextMuted     = Color(0xFF666666)

    // Structural
    val Border    = Color(0x33FFFFFF)  // 20% white
    val GlassCard = Color(0x0DFFFFFF) //  5% white

    // Gradients
    val GradientButton = Brush.horizontalGradient(listOf(Primary, Accent))
    val GradientHero   = Brush.verticalGradient(listOf(Color.Transparent, Background))
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
