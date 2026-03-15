package com.smartune.app.ui.screens

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import com.smartune.app.ui.theme.SmartuneColors

data class PricingTier(
    val name: String,
    val price: String,
    val features: List<String>,
    val color: Color,
    val isPopular: Boolean = false
)

@Composable
fun PremiumScreen(navController: NavHostController) {
    val tiers = listOf(
        PricingTier("Free", "$0/mes", listOf("3 prácticas/día", "Géneros básicos", "Anuncios"), Color.Gray),
        PricingTier("Pro", "$9.99/mes", listOf("Prácticas ilimitadas", "Todos los géneros", "Sin anuncios", "IA Studio básico"), SmartuneColors.Primary, isPopular = true),
        PricingTier("Elite", "$19.99/mes", listOf("Todo en Pro", "IA Studio Pro", "Soporte prioritario", "Acceso anticipado"), SmartuneColors.Gold),
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(SmartuneColors.Background)
            .verticalScroll(rememberScrollState())
            .padding(24.dp)
    ) {
        // Back Button
        IconButton(onClick = { navController.popBackStack() }) {
            Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Hero
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    Brush.linearGradient(listOf(SmartuneColors.Primary, SmartuneColors.PrimaryDark)),
                    RoundedCornerShape(24.dp)
                )
                .padding(32.dp),
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text("✨", fontSize = 48.sp)
                Spacer(modifier = Modifier.height(8.dp))
                Text("Desbloquea tu Potencial", color = Color.White, fontSize = 26.sp, fontWeight = FontWeight.ExtraBold, textAlign = TextAlign.Center)
                Spacer(modifier = Modifier.height(8.dp))
                Text("Lleva tu música al siguiente nivel", color = Color.White.copy(alpha = 0.8f), fontSize = 14.sp, textAlign = TextAlign.Center)
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Pricing Cards
        tiers.forEach { tier ->
            Card(
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = SmartuneColors.GlassCard),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 6.dp)
                    .border(
                        if (tier.isPopular) 2.dp else 0.5.dp,
                        if (tier.isPopular) tier.color else SmartuneColors.Border,
                        RoundedCornerShape(20.dp)
                    )
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(tier.name, color = tier.color, fontSize = 20.sp, fontWeight = FontWeight.ExtraBold)
                        if (tier.isPopular) {
                            Spacer(modifier = Modifier.width(8.dp))
                            Card(
                                shape = RoundedCornerShape(8.dp),
                                colors = CardDefaults.cardColors(containerColor = tier.color.copy(alpha = 0.2f))
                            ) {
                                Text("POPULAR", color = tier.color, fontSize = 10.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp))
                            }
                        }
                    }
                    Text(tier.price, color = Color.White, fontSize = 28.sp, fontWeight = FontWeight.ExtraBold)
                    Spacer(modifier = Modifier.height(12.dp))
                    tier.features.forEach { feature ->
                        Row(modifier = Modifier.padding(vertical = 4.dp)) {
                            Icon(Icons.Default.Check, contentDescription = null, tint = tier.color, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(feature, color = Color.Gray, fontSize = 13.sp)
                        }
                    }
                    Spacer(modifier = Modifier.height(16.dp))
                    Button(
                        onClick = { /* Payment flow */ },
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (tier.isPopular) tier.color else SmartuneColors.GlassCard
                        ),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text(
                            if (tier.name == "Free") "Plan Actual" else "Suscribirse",
                            fontWeight = FontWeight.Bold,
                            color = if (tier.isPopular) Color.White else Color.Gray
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(80.dp))
    }
}
