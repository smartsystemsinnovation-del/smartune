package com.smartune.app

import android.os.Bundle
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
import com.smartune.app.navigation.Screen
import com.smartune.app.navigation.SmartuneNavGraph
import com.smartune.app.ui.components.SmartuneBottomBar
import com.smartune.app.ui.theme.SmartuneColors
import com.smartune.app.ui.theme.SmartuneTheme
import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.functions.Functions
import io.github.jan.supabase.gotrue.Auth
import io.github.jan.supabase.postgrest.Postgrest

class MainActivity : ComponentActivity() {

    private val supabaseUrl = "https://mpsmvszyzrtxwadmjuei.supabase.co"
    private val supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wc212c3p5enJ0eHdhZG1qdWVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1MzY1NjAsImV4cCI6MjA4OTExMjU2MH0.FIdxI_ek02hfaE4lNe5bn8vcYs9-n-i1dT9k4OEVCU8"

    private val supabaseClient = createSupabaseClient(supabaseUrl, supabaseKey) {
        install(Postgrest)
        install(Functions)
        install(Auth)
    }

    private lateinit var practiceRepository: PracticeRepository

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        practiceRepository = PracticeRepository(supabaseClient)

        setContent {
            SmartuneTheme {
                SmartuneApp(practiceRepository, supabaseClient)
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

    // Routes where bottom bar should be hidden
    val hideBottomBar = currentRoute in listOf(
        Screen.Auth.route,
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