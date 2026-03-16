package com.smartune.app.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke

/**
 * Multicolor Google "G" logo drawn with Canvas.
 * Matches the real Google brand colors: Blue, Green, Yellow, Red.
 */
@Composable
fun GoogleLogo(modifier: Modifier = Modifier) {
    val googleBlue = Color(0xFF4285F4)
    val googleGreen = Color(0xFF34A853)
    val googleYellow = Color(0xFFFBBC05)
    val googleRed = Color(0xFFEA4335)

    Canvas(modifier = modifier) {
        val stroke = size.minDimension * 0.2f
        val radius = (size.minDimension - stroke) / 2f
        val center = Offset(size.width / 2f, size.height / 2f)

        // Blue arc (right side: -45° to 180°, i.e. top-right to left)
        drawArc(
            color = googleBlue,
            startAngle = -45f,
            sweepAngle = -165f,
            useCenter = false,
            topLeft = Offset(center.x - radius, center.y - radius),
            size = Size(radius * 2, radius * 2),
            style = Stroke(width = stroke, cap = StrokeCap.Butt)
        )

        // Green arc (bottom-left: 135° to 90°)
        drawArc(
            color = googleGreen,
            startAngle = 135f,
            sweepAngle = -75f,
            useCenter = false,
            topLeft = Offset(center.x - radius, center.y - radius),
            size = Size(radius * 2, radius * 2),
            style = Stroke(width = stroke, cap = StrokeCap.Butt)
        )

        // Yellow arc (bottom: 60° to 75°)
        drawArc(
            color = googleYellow,
            startAngle = 60f,
            sweepAngle = -40f,
            useCenter = false,
            topLeft = Offset(center.x - radius, center.y - radius),
            size = Size(radius * 2, radius * 2),
            style = Stroke(width = stroke, cap = StrokeCap.Butt)
        )

        // Red arc (top-right: 20° to 60°)
        drawArc(
            color = googleRed,
            startAngle = 20f,
            sweepAngle = -65f,
            useCenter = false,
            topLeft = Offset(center.x - radius, center.y - radius),
            size = Size(radius * 2, radius * 2),
            style = Stroke(width = stroke, cap = StrokeCap.Butt)
        )

        // Blue horizontal bar (the crossbar of the G)
        drawLine(
            color = googleBlue,
            start = Offset(center.x, center.y),
            end = Offset(center.x + radius * 0.85f, center.y),
            strokeWidth = stroke,
            cap = StrokeCap.Butt
        )
    }
}
