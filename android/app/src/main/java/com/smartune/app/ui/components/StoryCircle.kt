package com.smartune.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.smartune.app.ui.theme.SmartuneColors

/**
 * Story circle component matching Figma Home screen:
 * Circular avatar with neon purple/pink gradient border.
 */
@Composable
fun StoryCircle(
    imageUrl: String?,
    label: String,
    modifier: Modifier = Modifier,
    isAddButton: Boolean = false
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = modifier.width(70.dp)
    ) {
        Box(
            modifier = Modifier
                .size(64.dp)
                .border(
                    width = 2.5.dp,
                    brush = if (isAddButton)
                        Brush.linearGradient(listOf(SmartuneColors.TextMuted, SmartuneColors.TextMuted))
                    else
                        Brush.linearGradient(listOf(SmartuneColors.Primary, SmartuneColors.Accent)),
                    shape = CircleShape
                )
                .padding(3.dp)
                .clip(CircleShape)
                .background(SmartuneColors.SurfaceCard),
            contentAlignment = Alignment.Center
        ) {
            if (isAddButton) {
                Icon(
                    Icons.Default.Add,
                    contentDescription = "Añadir",
                    tint = SmartuneColors.Primary,
                    modifier = Modifier.size(24.dp)
                )
            } else if (imageUrl != null) {
                AsyncImage(
                    model = imageUrl,
                    contentDescription = label,
                    modifier = Modifier.fillMaxSize().clip(CircleShape),
                    contentScale = ContentScale.Crop
                )
            } else {
                Text(
                    label.take(1).uppercase(),
                    color = Color.White,
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }
        Spacer(modifier = Modifier.height(6.dp))
        Text(
            label,
            color = Color.White,
            fontSize = 10.sp,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
            textAlign = TextAlign.Center,
            modifier = Modifier.fillMaxWidth()
        )
    }
}
