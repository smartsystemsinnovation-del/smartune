package com.smartune.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.smartune.app.core.navigation.BottomNavBar
import com.smartune.app.core.navigation.NavGraph
import com.smartune.app.core.navigation.Routes
import com.smartune.app.core.supabase.SupabaseClient
import com.smartune.app.core.theme.SmarTuneTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        // Handle deep link for OAuth callback
        SupabaseClient.auth.handleDeeplinks(intent)

        setContent {
            SmarTuneTheme {
                val navController = rememberNavController()
                var isLoggedIn by remember { mutableStateOf<Boolean?>(null) }

                // Check session on launch
                LaunchedEffect(Unit) {
                    isLoggedIn = try {
                        SupabaseClient.auth.loadFromStorage()
                        SupabaseClient.auth.currentSessionOrNull() != null
                    } catch (e: Exception) {
                        false
                    }
                }

                // Show nothing while checking auth
                if (isLoggedIn == null) return@SmarTuneTheme

                val navBackStackEntry by navController.currentBackStackEntryAsState()
                val currentRoute = navBackStackEntry?.destination?.route

                // Routes that should NOT show the bottom nav bar
                val hideBottomBar = currentRoute in listOf(
                    Routes.LOGIN, Routes.ONBOARDING
                )

                Scaffold(
                    bottomBar = {
                        if (!hideBottomBar) BottomNavBar(navController = navController)
                    }
                ) { innerPadding ->
                    NavGraph(
                        navController = navController,
                        isLoggedIn = isLoggedIn ?: false,
                        modifier = Modifier.padding(innerPadding)
                    )
                }
            }
        }
    }
}