package com.smartune.app.ui.components

import androidx.compose.foundation.border
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
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
    val route: String
)

@Composable
fun SmartuneBottomBar(navController: NavHostController) {
    val items = listOf(
        BottomNavItem("Inicio", Icons.Default.Home, Screen.Home.route),
        BottomNavItem("Explorar", Icons.Default.Search, Screen.Explorar.route),
        BottomNavItem("Favoritos", Icons.Default.Favorite, Screen.Favoritos.route),
        BottomNavItem("IA Studio", Icons.Default.AutoAwesome, Screen.IAStudio.route),
        BottomNavItem("Perfil", Icons.Default.AccountCircle, Screen.Perfil.route),
    )

    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    NavigationBar(
        containerColor = Color(0xE6120E19),
        modifier = Modifier
            .border(1.dp, SmartuneColors.Border, RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp))
    ) {
        items.forEach { item ->
            NavigationBarItem(
                icon = { Icon(item.icon, contentDescription = item.label) },
                label = { Text(item.label, fontSize = 9.sp) },
                selected = currentRoute == item.route,
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
                    indicatorColor = Color(0x1AD000FF),
                    unselectedIconColor = Color.Gray
                )
            )
        }
    }
}
