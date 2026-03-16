package com.smartune.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import androidx.navigation.compose.currentBackStackEntryAsState
import com.smartune.app.navigation.Screen
import com.smartune.app.ui.theme.SmartuneColors

data class BottomNavItem(
    val label: String,
    val icon: ImageVector,
    val route: String,
    val isCenterFab: Boolean = false
)

/**
 * Bottom Navigation Bar matching Figma design:
 * 5 items with a central elevated FAB (Play button) in magenta gradient.
 */
@Composable
fun SmartuneBottomBar(navController: NavHostController) {
    val items = listOf(
        BottomNavItem("Inicio", Icons.Default.Home, Screen.Home.route),
        BottomNavItem("Descubre", Icons.Default.Explore, Screen.Explorar.route),
        BottomNavItem("Play", Icons.Default.PlayArrow, Screen.Favoritos.route, isCenterFab = true),
        BottomNavItem("Arcade", Icons.Default.SportsEsports, Screen.Arcade.route),
        BottomNavItem("Perfil", Icons.Default.Person, Screen.Perfil.route),
    )

    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(80.dp)
    ) {
        // Background bar
        Surface(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
                .height(68.dp),
            color = Color(0xF0100C18),
            shape = RoundedCornerShape(topStart = 0.dp, topEnd = 0.dp),
            shadowElevation = 8.dp,
            tonalElevation = 0.dp
        ) {
            Row(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 8.dp),
                horizontalArrangement = Arrangement.SpaceAround,
                verticalAlignment = Alignment.CenterVertically
            ) {
                items.forEach { item ->
                    if (item.isCenterFab) {
                        // Spacer for the FAB position
                        Spacer(modifier = Modifier.width(56.dp))
                    } else {
                        val isSelected = currentRoute == item.route
                        NavigationBarItem(
                            icon = {
                                Icon(
                                    item.icon,
                                    contentDescription = item.label,
                                    modifier = Modifier.size(22.dp)
                                )
                            },
                            label = {
                                Text(
                                    item.label,
                                    fontSize = 9.sp,
                                    color = if (isSelected) SmartuneColors.Primary else SmartuneColors.TextMuted
                                )
                            },
                            selected = isSelected,
                            onClick = {
                                if (currentRoute != item.route) {
                                    navController.navigate(item.route) {
                                        popUpTo(Screen.Home.route) { saveState = true }
                                        launchSingleTop = true
                                        restoreState = true
                                    }
                                }
                            },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = SmartuneColors.Primary,
                                indicatorColor = Color.Transparent,
                                unselectedIconColor = SmartuneColors.TextMuted
                            )
                        )
                    }
                }
            }
        }

        // Center elevated FAB
        Box(
            modifier = Modifier
                .align(Alignment.TopCenter)
                .offset(y = (-4).dp)
                .size(56.dp)
                .clip(CircleShape)
                .background(SmartuneColors.GradientButton)
                .border(
                    width = 3.dp,
                    color = SmartuneColors.Background,
                    shape = CircleShape
                ),
            contentAlignment = Alignment.Center
        ) {
            IconButton(
                onClick = {
                    if (currentRoute != Screen.Favoritos.route) {
                        navController.navigate(Screen.Favoritos.route) {
                            popUpTo(Screen.Home.route) { saveState = true }
                            launchSingleTop = true
                            restoreState = true
                        }
                    }
                }
            ) {
                Icon(
                    Icons.Default.PlayArrow,
                    contentDescription = "Play",
                    tint = Color.White,
                    modifier = Modifier.size(28.dp)
                )
            }
        }
    }
}
