package com.smartune.app.core.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Explore
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.People
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.outlined.Explore
import androidx.compose.material.icons.outlined.FavoriteBorder
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.PeopleOutline
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material.icons.outlined.School
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.produceState
import androidx.compose.runtime.remember
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import androidx.navigation.compose.currentBackStackEntryAsState
import com.smartune.app.core.theme.BgCard
import com.smartune.app.core.theme.NeonPink
import com.smartune.app.core.theme.TextTertiary
import com.smartune.app.explorar.data.models.UserProfile
import com.smartune.app.explorar.data.repository.SocialRepository

data class BottomNavItem(
    val route: String,
    val label: String,
    val selectedIcon: ImageVector,
    val unselectedIcon: ImageVector
)

@Composable
fun BottomNavBar(navController: NavController) {
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    val repo = remember { SocialRepository() }
    val userProfile by produceState<UserProfile?>(initialValue = null) {
        value = repo.getProfile()
    }

    val isProfesor = userProfile?.rol == "profesor" || userProfile?.profesorAprobado == true

    val bottomNavItems = if (isProfesor) {
        listOf(
            BottomNavItem(Routes.HOME, "Inicio", Icons.Filled.Home, Icons.Outlined.Home),
            BottomNavItem(Routes.EXPLORAR, "Explorar", Icons.Filled.Explore, Icons.Outlined.Explore),
            BottomNavItem(Routes.FAVORITOS, "Favoritos", Icons.Filled.Favorite, Icons.Outlined.FavoriteBorder),
            BottomNavItem(Routes.TEACHER_DASHBOARD, "Alumnos", Icons.Filled.People, Icons.Outlined.PeopleOutline),
            BottomNavItem(Routes.PROFILE, "Perfil", Icons.Filled.Person, Icons.Outlined.Person),
        )
    } else {
        listOf(
            BottomNavItem(Routes.HOME, "Inicio", Icons.Filled.Home, Icons.Outlined.Home),
            BottomNavItem(Routes.EXPLORAR, "Explorar", Icons.Filled.Explore, Icons.Outlined.Explore),
            BottomNavItem(Routes.FAVORITOS, "Favoritos", Icons.Filled.Favorite, Icons.Outlined.FavoriteBorder),
            BottomNavItem(Routes.PROFESORES, "Profesores", Icons.Filled.School, Icons.Outlined.School),
            BottomNavItem(Routes.PROFILE, "Perfil", Icons.Filled.Person, Icons.Outlined.Person),
        )
    }

    NavigationBar(
        containerColor = BgCard,
        tonalElevation = 0.dp
    ) {
        bottomNavItems.forEach { item ->
            val selected = currentRoute == item.route
            NavigationBarItem(
                selected = selected,
                onClick = {
                    if (currentRoute != item.route) {
                        navController.navigate(item.route) {
                            navController.graph.startDestinationRoute?.let { startRoute ->
                                popUpTo(startRoute) {
                                    saveState = true
                                }
                            }
                            launchSingleTop = true
                            restoreState = true
                        }
                    }
                },
                icon = {
                    Icon(
                        imageVector = if (selected) item.selectedIcon else item.unselectedIcon,
                        contentDescription = item.label
                    )
                },
                label = { Text(item.label, fontSize = 10.sp) },
                colors = NavigationBarItemDefaults.colors(
                    selectedIconColor = NeonPink,
                    selectedTextColor = NeonPink,
                    unselectedIconColor = TextTertiary,
                    unselectedTextColor = TextTertiary,
                    indicatorColor = Color.Transparent
                )
            )
        }
    }
}
