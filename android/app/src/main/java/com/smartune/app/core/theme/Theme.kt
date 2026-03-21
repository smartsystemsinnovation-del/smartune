package com.smartune.app.core.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

private val SmarTuneDarkScheme = darkColorScheme(
    primary = NeonPink,
    secondary = NeonPurple,
    tertiary = NeonBlue,
    background = BgMain,
    surface = BgCard,
    surfaceVariant = BgSurface,
    onPrimary = TextPrimary,
    onSecondary = TextPrimary,
    onBackground = TextPrimary,
    onSurface = TextPrimary,
    onSurfaceVariant = TextSecondary,
    outline = TextTertiary,
)

@Composable
fun SmarTuneTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = SmarTuneDarkScheme,
        typography = SmarTuneTypography,
        content = content
    )
}
