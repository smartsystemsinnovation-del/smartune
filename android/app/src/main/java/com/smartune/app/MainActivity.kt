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
import androidx.compose.runtime.collectAsState
import androidx.compose.ui.Modifier
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.smartune.app.core.navigation.BottomNavBar
import com.smartune.app.core.navigation.NavGraph
import com.smartune.app.core.navigation.Routes
import com.smartune.app.core.supabase.SupabaseClient
import com.smartune.app.core.theme.SmarTuneTheme
import io.github.jan.supabase.gotrue.handleDeeplinks
import kotlinx.coroutines.launch
import com.smartune.app.explorar.data.repository.SocialRepository
import com.google.firebase.messaging.FirebaseMessaging
import androidx.compose.runtime.rememberCoroutineScope

class MainActivity : ComponentActivity() {
    override fun onNewIntent(intent: android.content.Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        SupabaseClient.client.handleDeeplinks(intent)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        // Handle deep link for OAuth callback on cold start
        val isRecovery = intent?.data?.toString()?.contains("type=recovery") == true
        intent?.let { SupabaseClient.client.handleDeeplinks(it) }

        setContent {
            SmarTuneTheme {
                val navController = rememberNavController()
                val sessionStatus by SupabaseClient.auth.sessionStatus.collectAsState(
                    initial = io.github.jan.supabase.gotrue.SessionStatus.LoadingFromStorage
                )

                // Show nothing while checking auth initially
                if (sessionStatus is io.github.jan.supabase.gotrue.SessionStatus.LoadingFromStorage) {
                    return@SmarTuneTheme
                }

                val isLoggedIn = sessionStatus is io.github.jan.supabase.gotrue.SessionStatus.Authenticated
                val scope = rememberCoroutineScope()

                LaunchedEffect(isLoggedIn) {
                    if (isLoggedIn) {
                        try {
                            FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
                                if (task.isSuccessful) {
                                    val token = task.result
                                    scope.launch {
                                        SocialRepository().updateFcmToken(token)
                                    }
                                }
                            }
                        } catch (e: Exception) {
                            e.printStackTrace()
                        }
                    }
                }

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
                        isLoggedIn = isLoggedIn,
                        startWithRecovery = isRecovery,
                        modifier = Modifier.padding(innerPadding)
                    )
                }
            }
        }
    }
}