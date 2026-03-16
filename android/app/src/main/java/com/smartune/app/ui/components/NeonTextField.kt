package com.smartune.app.ui.components

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import com.smartune.app.ui.theme.SmartuneColors

@Composable
fun NeonTextField(
    value: String,
    onValueChange: (String) -> Unit,
    placeholder: String,
    modifier: Modifier = Modifier,
    leadingIcon: ImageVector? = null,
    trailingIcon: @Composable (() -> Unit)? = null,
    visualTransformation: VisualTransformation = VisualTransformation.None,
    keyboardOptions: KeyboardOptions = KeyboardOptions.Default,
    singleLine: Boolean = true,
    label: String? = null
) {
    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        placeholder = { Text(placeholder, color = SmartuneColors.TextMuted) },
        label = label?.let { { Text(it, color = SmartuneColors.TextSecondary) } },
        leadingIcon = leadingIcon?.let {
            { Icon(it, contentDescription = null, tint = SmartuneColors.TextSecondary) }
        },
        trailingIcon = trailingIcon,
        singleLine = singleLine,
        visualTransformation = visualTransformation,
        keyboardOptions = keyboardOptions,
        colors = OutlinedTextFieldDefaults.colors(
            focusedBorderColor = SmartuneColors.Primary,
            unfocusedBorderColor = SmartuneColors.Border,
            focusedTextColor = Color.White,
            unfocusedTextColor = Color.White,
            cursorColor = SmartuneColors.Primary,
            focusedLabelColor = SmartuneColors.Primary,
            unfocusedLabelColor = SmartuneColors.TextSecondary,
            focusedContainerColor = SmartuneColors.InputBackground,
            unfocusedContainerColor = SmartuneColors.InputBackground
        ),
        modifier = modifier,
        shape = RoundedCornerShape(14.dp)
    )
}
