package com.smartune.app.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.smartune.app.data.repository.PracticeRepository
import com.smartune.app.ui.screens.*
import io.github.jan.supabase.SupabaseClient

sealed class Screen(val route: String) {
    // Auth flow (no bottom bar)
    data object Auth : Screen("auth")
    data object ForgotPassword : Screen("forgot-password")
    data object Onboarding : Screen("onboarding")

    // Main tabs (with bottom bar)
    data object Home : Screen("home")
    data object Explorar : Screen("explorar")
    data object Favoritos : Screen("favoritos")
    data object Playlist : Screen("playlist")
    data object Perfil : Screen("perfil")
    data object Arcade : Screen("arcade")

    // Secondary screens (no bottom bar)
    data object Premium : Screen("premium")
    data object IAStudio : Screen("ia-studio")
    data object SmarTiles : Screen("smar-tiles")
}

@Composable
fun SmartuneNavGraph(
    navController: NavHostController,
    practiceRepository: PracticeRepository,
    supabaseClient: SupabaseClient
) {
    NavHost(navController = navController, startDestination = Screen.Auth.route) {
        composable(Screen.Auth.route) {
            AuthScreen(navController, supabaseClient)
        }
        composable(Screen.ForgotPassword.route) {
            ForgotPasswordScreen(navController, supabaseClient)
        }
        composable(Screen.Onboarding.route) {
            OnboardingScreen(navController, supabaseClient)
        }
        composable(Screen.Home.route) {
            HomeScreen(navController, practiceRepository)
        }
        composable(Screen.Explorar.route) {
            ExplorarScreen()
        }
        composable(Screen.Favoritos.route) {
            FavoritosScreen(navController)
        }
        composable(Screen.Playlist.route) {
            PlaylistScreen(navController)
        }
        composable(Screen.Perfil.route) {
            PerfilScreen(navController)
        }
        composable(Screen.Arcade.route) {
            ArcadeScreen(navController)
        }
        composable(Screen.Premium.route) {
            PremiumScreen(navController)
        }
        composable(Screen.IAStudio.route) {
            IAStudioScreen()
        }
        composable(Screen.SmarTiles.route) {
            SmarTilesScreen(navController)
        }
    }
}

