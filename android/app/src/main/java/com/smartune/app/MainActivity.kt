package com.smartune.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountCircle
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.smartune.app.data.repository.PracticeRepository
import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.functions.Functions
import io.github.jan.supabase.gotrue.Auth
import io.github.jan.supabase.postgrest.Postgrest
import kotlinx.coroutines.launch

// --- NUCLEO DE LA APLICACIÓN ---

class MainActivity : ComponentActivity() {
    private val supabaseUrl = "https://mpsmvszyzrtxwadmjuei.supabase.co"
    private val supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wc212c3p5enJ0eHdhZG1qdWVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1MzY1NjAsImV4cCI6MjA4OTExMjU2MH0.FIdxI_ek02hfaE4lNe5bn8vcYs9-n-i1dT9k4OEVCU8"

    private val supabaseClient = createSupabaseClient(supabaseUrl, supabaseKey) {
        install(Postgrest)
        install(Functions)
    }

    private lateinit var practiceRepository: PracticeRepository

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        practiceRepository = PracticeRepository(supabaseClient)

        setContent {
            SmartuneTheme {
                Surface(modifier = Modifier.fillMaxSize(), color = Color(0xFF15101C)) {
                    MainScreen(practiceRepository)
                }
            }
        }
    }
}

// --- TEMATIZACIÓN PREMIUM ---

@Composable
fun SmartuneTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = darkColorScheme(
            background = Color(0xFF15101C),
            surface = Color(0xFF1F1F1F),
            primary = Color(0xFFF6339A),
            secondary = Color(0xFF9810FA)
        ),
        content = content
    )
}

// --- PANTALLA PRINCIPAL Y NAVEGACIÓN ---

@Composable
fun MainScreen(repository: PracticeRepository) {
    var selectedItem by remember { mutableIntStateOf(0) }
    val menuItems = listOf("Inicio", "Explorar", "Perfil")
    val icons = listOf(Icons.Default.Home, Icons.Default.Search, Icons.Default.AccountCircle)

    Scaffold(
        bottomBar = {
            NavigationBar(
                containerColor = Color(0xCC120E19),
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, Color(0x1AFFFFFF), RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp))
            ) {
                menuItems.forEachIndexed { index, item ->
                    NavigationBarItem(
                        icon = { Icon(icons[index], contentDescription = item) },
                        label = { Text(item, fontSize = 10.sp) },
                        selected = selectedItem == index,
                        onClick = { selectedItem = index },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = Color(0xFFF6339A),
                            indicatorColor = Color(0x1AF6339A),
                            unselectedIconColor = Color.Gray
                        )
                    )
                }
            }
        },
        containerColor = Color(0xFF15101C)
    ) { innerPadding ->
        Box(modifier = Modifier.padding(innerPadding)) {
            when (selectedItem) {
                0 -> DashboardScreen(repository)
                1 -> ExplorarScreen()
                2 -> PerfilScreen()
            }
        }
    }
}

// --- MÓDULO: DASHBOARD (PRÁCTICAS DIARIAS) ---

@Composable
fun DashboardScreen(repository: PracticeRepository) {
    var tasks by remember { mutableStateOf<List<Map<String, Any>>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    val coroutineScope = rememberCoroutineScope()

    LaunchedEffect(Unit) {
        coroutineScope.launch {
            repository.getDailyTasks("fake-user-id").onSuccess {
                tasks = it
                isLoading = false
            }.onFailure { isLoading = false }
        }
    }

    Column(modifier = Modifier.fillMaxSize().padding(24.dp)) {
        HeaderSection("Tus Prácticas", "Método Ebbinghaus")

        if (isLoading) {
            Box(modifier = Modifier.weight(1f), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = Color(0xFF9810FA))
            }
        } else {
            LazyColumn(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                items(tasks) { task -> TaskCard(task) }
            }
        }
    }
}

// --- MÓDULO: EXPLORAR (CATÁLOGO VISUAL) ---

@Composable
fun ExplorarScreen() {
    val categorias = listOf("Piano Classic", "Synthwave", "Jazz Impro", "Lo-Fi Study", "Metal Shred", "Techno")

    Column(modifier = Modifier.fillMaxSize().padding(24.dp)) {
        HeaderSection("Explorar", "Nuevos Desafíos")

        LazyVerticalGrid(
            columns = GridCells.Fixed(2),
            horizontalArrangement = Arrangement.spacedBy(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            items(categorias) { cat ->
                CategoryCard(cat)
            }
        }
    }
}

// --- MÓDULO: PERFIL (IDENTIDAD CREADOR) ---

@Composable
fun PerfilScreen() {
    Column(
        modifier = Modifier.fillMaxSize().padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        HeaderSection("Perfil", "Nivel Avanzado")

        Spacer(modifier = Modifier.height(32.dp))

        // Avatar Estilo Apple
        Box(
            modifier = Modifier
                .size(120.dp)
                .background(Brush.linearGradient(listOf(Color(0xFFF6339A), Color(0xFF9810FA))), CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Text("LS", color = Color.White, fontSize = 40.sp, fontWeight = FontWeight.Bold)
        }

        Spacer(modifier = Modifier.height(16.dp))
        Text("lagsuz_creator", color = Color.White, fontSize = 24.sp, fontWeight = FontWeight.Bold)
        Text("Racha de 15 días 🔥", color = Color(0xFFF6339A), fontSize = 16.sp)

        Spacer(modifier = Modifier.height(40.dp))

        ProfileStatRow("Prácticas Completadas", "124")
        ProfileStatRow("Precisión Media", "94%")
        ProfileStatRow("Tiempo Total", "48h 20m")
    }
}

// --- COMPONENTES DE APOYO (UI REUTILIZABLE) ---

@Composable
fun HeaderSection(title: String, subtitle: String) {
    Column(modifier = Modifier.padding(bottom = 32.dp)) {
        Text(text = title, color = Color.White, fontSize = 34.sp, fontWeight = FontWeight.ExtraBold)
        Text(text = subtitle, color = Color(0xFFF6339A), fontSize = 16.sp, fontWeight = FontWeight.Medium)
    }
}

@Composable
fun TaskCard(task: Map<String, Any>) {
    Card(
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0x1AFFFFFF)),
        modifier = Modifier.fillMaxWidth().border(0.5.dp, Color(0x33FFFFFF), RoundedCornerShape(20.dp))
    ) {
        Row(modifier = Modifier.padding(20.dp), verticalAlignment = Alignment.CenterVertically) {
            Canvas(modifier = Modifier.size(12.dp)) {
                drawCircle(Brush.linearGradient(listOf(Color(0xFF9810FA), Color(0xFF0E9EEF))))
            }
            Spacer(modifier = Modifier.width(16.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text("Lección: ${task["cancion_id"].toString().take(8)}", color = Color.White, fontWeight = FontWeight.Bold)
                Text("Siguiente repaso en 4h", color = Color.Gray, fontSize = 12.sp)
            }
            Button(
                onClick = {},
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF6339A)),
                shape = RoundedCornerShape(10.dp)
            ) {
                Text("Practicar", fontSize = 12.sp)
            }
        }
    }
}

@Composable
fun CategoryCard(name: String) {
    Box(
        modifier = Modifier
            .height(120.dp)
            .clip(RoundedCornerShape(20.dp))
            .background(Color(0x0DFFFFFF))
            .border(0.5.dp, Color(0x1AFFFFFF), RoundedCornerShape(20.dp))
            .clickable { },
        contentAlignment = Alignment.Center
    ) {
        Text(text = name, color = Color.White, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center)
    }
}

@Composable
fun ProfileStatRow(label: String, value: String) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(vertical = 12.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(label, color = Color.Gray)
        Text(value, color = Color.White, fontWeight = FontWeight.Bold)
    }
}

@Preview(showBackground = true)
@Composable
fun FullPreview() {
    SmartuneTheme {
        ExplorarScreen()
    }
}