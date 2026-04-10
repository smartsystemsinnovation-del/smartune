package com.smartune.app.core.navigation

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.compose.runtime.getValue
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
import com.smartune.app.course.CourseDetailScreen
import com.smartune.app.player.PlayerScreen

@Composable
fun NavGraph(
    navController: NavHostController,
    isLoggedIn: Boolean,
    modifier: Modifier = Modifier,
    startWithRecovery: Boolean = false,
    startDestination: String = if (isLoggedIn || startWithRecovery) Routes.HOME else Routes.LOGIN
) {
    val finalStartDestination = if (startWithRecovery) Routes.LOGIN else startDestination
    
    // Actively protect the graph from ghost logins. If Supabase drops the session, kick them out.
    // Also, if they authenticate via DeepLink (e.g. Google), pull them into HOME.
    val currentEntry by navController.currentBackStackEntryAsState()
    
    androidx.compose.runtime.LaunchedEffect(isLoggedIn, currentEntry?.destination?.route) {
        val currentRoute = currentEntry?.destination?.route
        if (!isLoggedIn && currentRoute != Routes.LOGIN && currentRoute != null) {
            navController.navigate(Routes.LOGIN) {
                popUpTo(0) { inclusive = true }
            }
        } else if (isLoggedIn && currentRoute == Routes.LOGIN) {
            // Auto-sync user if they just logged in via Deeplink
            try {
                com.smartune.app.explorar.data.repository.SocialRepository().syncUserProfile()
            } catch(_: Exception) {}
            
            navController.navigate(Routes.HOME) {
                popUpTo(Routes.LOGIN) { inclusive = true }
            }
        }
    }

    NavHost(
        navController = navController,
        startDestination = finalStartDestination,
        modifier = modifier
    ) {
        // ── Auth ──
        composable(Routes.LOGIN) {
            LoginScreen(
                startWithRecovery = startWithRecovery,
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

        composable(
            route = Routes.COURSE_DETAIL,
            arguments = listOf(navArgument("courseId") { type = NavType.StringType })
        ) {
            CourseDetailScreen(
                onNavigateBack = { navController.popBackStack() },
                onNavigateToPlayer = { lessonId -> navController.navigate(Routes.player(lessonId)) }
            )
        }

        composable(
            route = Routes.PLAYER,
            arguments = listOf(navArgument("lessonId") { type = NavType.StringType })
        ) {
            PlayerScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }
    }
}
