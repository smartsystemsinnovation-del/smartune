package com.smartune.app.core.navigation

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import com.smartune.app.auth.ui.LoginScreen
import com.smartune.app.explorar.ui.ExplorarScreen
import com.smartune.app.favoritos.ui.FavoritosScreen
import com.smartune.app.home.ui.HomeScreen
import com.smartune.app.premium.ui.PremiumScreen
import com.smartune.app.profesores.ui.HaztePrScreen
import com.smartune.app.profesores.ui.ProfesorDetailScreen
import com.smartune.app.profesores.ui.ProfesoresScreen
import com.smartune.app.profile.ui.ProfileScreen
import com.smartune.app.teacher.ui.CrearClaseScreen
import com.smartune.app.teacher.ui.TeacherDashboardScreen

@Composable
fun NavGraph(
    navController: NavHostController,
    isLoggedIn: Boolean,
    modifier: Modifier = Modifier,
    startDestination: String = if (isLoggedIn) Routes.HOME else Routes.LOGIN
) {
    NavHost(
        navController = navController,
        startDestination = startDestination,
        modifier = modifier
    ) {
        // ── Auth ──
        composable(Routes.LOGIN) {
            LoginScreen(
                onLoginSuccess = {
                    navController.navigate(Routes.HOME) {
                        popUpTo(Routes.LOGIN) { inclusive = true }
                    }
                }
            )
        }

        // ── Main Tabs ──
        composable(Routes.HOME) {
            HomeScreen(navController = navController)
        }

        composable(Routes.EXPLORAR) {
            ExplorarScreen(navController = navController)
        }

        composable(Routes.FAVORITOS) {
            FavoritosScreen(navController = navController)
        }

        composable(Routes.PROFESORES) {
            ProfesoresScreen(navController = navController)
        }

        composable(Routes.PROFILE) {
            ProfileScreen(
                navController = navController,
                onLogout = {
                    navController.navigate(Routes.LOGIN) {
                        popUpTo(0) { inclusive = true }
                    }
                }
            )
        }

        // ── Sub-screens ──
        composable(
            route = Routes.PROFESOR_DETAIL,
            arguments = listOf(navArgument("profesorId") { type = NavType.StringType })
        ) { backStackEntry ->
            val profesorId = backStackEntry.arguments?.getString("profesorId") ?: return@composable
            ProfesorDetailScreen(profesorId = profesorId, navController = navController)
        }

        composable(Routes.HAZTE_PROFESOR) {
            HaztePrScreen(navController = navController)
        }

        composable(Routes.TEACHER_DASHBOARD) {
            TeacherDashboardScreen(navController = navController)
        }

        composable(Routes.CREAR_CLASE) {
            CrearClaseScreen(navController = navController)
        }

        composable(Routes.PREMIUM) {
            PremiumScreen(navController = navController)
        }
    }
}
