package com.smartune.app

import android.content.Intent
import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.smartune.app.data.repository.PracticeRepository
import com.smartune.app.data.SupabaseModule
import com.smartune.app.navigation.Screen
import com.smartune.app.navigation.SmartuneNavGraph
import com.smartune.app.ui.components.SmartuneBottomBar
import com.smartune.app.ui.theme.SmartuneColors
import com.smartune.app.ui.theme.SmartuneTheme
import io.github.jan.supabase.gotrue.auth
import io.github.jan.supabase.gotrue.SessionStatus
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {

    private val supabaseClient = SupabaseModule.client
    private lateinit var practiceRepository: PracticeRepository

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        practiceRepository = PracticeRepository(supabaseClient)

        // Handle initial intent (cold start from deep link)
        handleIntent(intent)

        setContent {
            SmartuneTheme {
                SmartuneApp(practiceRepository, supabaseClient)
            }
        }
    }

    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
        handleIntent(intent)
    }

    /**
     * Handles the OAuth deep link redirect.
     * After Google Sign-In, the browser redirects to:
     *   smartune-auth://callback#access_token=...&refresh_token=...&...
     * We parse the fragment and import the session into Supabase.
     */
    private fun handleIntent(intent: Intent?) {
        val uri = intent?.data ?: return
        if (uri.scheme != "smartune-auth") return

        // The tokens come in the URI fragment (after #)
        val fragment = uri.fragment ?: return
        val params = fragment.split("&").associate {
            val parts = it.split("=", limit = 2)
            parts[0] to (parts.getOrNull(1) ?: "")
        }

        val accessToken = params["access_token"]
        val refreshToken = params["refresh_token"]

        if (accessToken != null && refreshToken != null) {
            Log.d("SmarTune", "OAuth callback received, importing session...")
            CoroutineScope(Dispatchers.IO).launch {
                try {
                    supabaseClient.auth.importAuthToken(accessToken)
                    Log.d("SmarTune", "Session imported successfully!")
                } catch (e: Exception) {
                    Log.e("SmarTune", "Error importing session: ${e.message}")
                }
            }
        }
    }
}

@Composable
fun SmartuneApp(
    practiceRepository: PracticeRepository,
    supabaseClient: io.github.jan.supabase.SupabaseClient
) {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    // Automatically navigate to Home when user becomes authenticated
    LaunchedEffect(Unit) {
        supabaseClient.auth.sessionStatus.collect { status ->
            if (status is SessionStatus.Authenticated) {
                if (navController.currentDestination?.route == Screen.Auth.route) {
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.Auth.route) { inclusive = true }
                    }
                }
            }
        }
    }

    // Routes where bottom bar should be hidden
    val hideBottomBar = currentRoute in listOf(
        Screen.Auth.route,
        Screen.ForgotPassword.route,
        Screen.Onboarding.route,
        Screen.Premium.route,
        Screen.SmarTiles.route,
        Screen.Playlist.route
    )

    Surface(modifier = Modifier.fillMaxSize(), color = SmartuneColors.Background) {
        Scaffold(
            bottomBar = {
                if (!hideBottomBar) {
                    SmartuneBottomBar(navController)
                }
            },
            containerColor = Color.Transparent
        ) { innerPadding ->
            Box(modifier = Modifier.padding(innerPadding)) {
                SmartuneNavGraph(
                    navController = navController,
                    practiceRepository = practiceRepository,
                    supabaseClient = supabaseClient
                )
            }
        }
    }
}