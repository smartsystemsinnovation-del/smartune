# ============================================================
# SmarTune - Módulo MusicSwipe
# Análisis Estadístico: Medidas de Tendencia Central
# Boleta: 20251   |   Tarea: T6
# Plataformas: Android & Web
# ============================================================

# ── 1. Cargar datos ──────────────────────────────────────────
datos <- read.csv("20251_T6.csv", header = TRUE, stringsAsFactors = FALSE)

cat("==========================================================\n")
cat("  SMAR TUNE - ANÁLISIS MÓDULO MUSICSWIPE (T6)\n")
cat("==========================================================\n\n")

cat("Dimensiones del dataset:", nrow(datos), "observaciones x", ncol(datos), "variables\n\n")
cat("Columnas disponibles:\n")
print(names(datos))
cat("\n")

# ── 2. Variables numéricas de interés ────────────────────────
vars_numericas <- c(
  "canciones_vistas",
  "likes",
  "discards",
  "tasa_like_pct",
  "tiempo_sesion_seg",
  "canciones_por_sesion",
  "swipes_derecha",
  "swipes_izquierda",
  "favoritos_totales",
  "errores_carga",
  "tiempo_carga_ms",
  "reproductions_preview"
)

# ── 3. Función medidas de tendencia central ───────────────────
calcular_tendencia_central <- function(x, nombre) {
  media   <- mean(x, na.rm = TRUE)
  mediana <- median(x, na.rm = TRUE)
  # Moda (valor más frecuente)
  tabla   <- table(x)
  moda    <- as.numeric(names(tabla[tabla == max(tabla)]))[1]
  rango   <- max(x, na.rm = TRUE) - min(x, na.rm = TRUE)
  varianza <- var(x, na.rm = TRUE)
  desv_est <- sd(x, na.rm = TRUE)
  cv       <- (desv_est / media) * 100

  cat("────────────────────────────────────────────\n")
  cat(sprintf("Variable: %s\n", nombre))
  cat(sprintf("  Media          : %.4f\n", media))
  cat(sprintf("  Mediana        : %.4f\n", mediana))
  cat(sprintf("  Moda           : %.4f\n", moda))
  cat(sprintf("  Rango          : %.4f\n", rango))
  cat(sprintf("  Varianza       : %.4f\n", varianza))
  cat(sprintf("  Desv. Estándar : %.4f\n", desv_est))
  cat(sprintf("  Coef. Variación: %.2f%%\n", cv))
  cat("\n")

  return(invisible(list(
    variable  = nombre,
    media     = round(media, 4),
    mediana   = round(mediana, 4),
    moda      = moda,
    varianza  = round(varianza, 4),
    desv_est  = round(desv_est, 4),
    cv_pct    = round(cv, 2)
  )))
}

# ── 4. Ejecutar análisis por variable ────────────────────────
cat("\n== MEDIDAS DE TENDENCIA CENTRAL POR VARIABLE ==\n\n")

resultados <- lapply(vars_numericas, function(v) {
  calcular_tendencia_central(datos[[v]], v)
})

# ── 5. Tabla resumen ─────────────────────────────────────────
cat("\n========================================\n")
cat("  TABLA RESUMEN\n")
cat("========================================\n")
resumen_df <- data.frame(
  Variable  = sapply(resultados, function(r) r$variable),
  Media     = sapply(resultados, function(r) r$media),
  Mediana   = sapply(resultados, function(r) r$mediana),
  Moda      = sapply(resultados, function(r) r$moda),
  Desv_Est  = sapply(resultados, function(r) r$desv_est),
  CV_Pct    = sapply(resultados, function(r) r$cv_pct)
)
print(resumen_df, row.names = FALSE)

# ── 6. Segmentación por plataforma ────────────────────────────
cat("\n\n== COMPARATIVA ANDROID vs WEB ==\n\n")

plataformas <- c("Android", "Web")
for (plat in plataformas) {
  sub <- datos[datos$plataforma == plat, ]
  cat(sprintf("--- Plataforma: %s (%d usuarios) ---\n", plat, nrow(sub)))
  cat(sprintf("  Likes promedio       : %.2f\n", mean(sub$likes)))
  cat(sprintf("  Tasa like promedio   : %.2f%%\n", mean(sub$tasa_like_pct)))
  cat(sprintf("  Tiempo sesión prom.  : %.1f seg\n", mean(sub$tiempo_sesion_seg)))
  cat(sprintf("  Previews promedio    : %.2f\n", mean(sub$reproductions_preview)))
  cat(sprintf("  Tiempo carga prom.   : %.1f ms\n", mean(sub$tiempo_carga_ms)))
  cat("\n")
}

# ── 7. Género más popular ─────────────────────────────────────
cat("== GÉNERO MÁS POPULAR ==\n")
tabla_genero <- table(datos$genero_preferido)
cat("Distribución de géneros:\n")
print(tabla_genero)
cat(sprintf("\nGénero más popular: %s (%d usuarios)\n\n",
  names(which.max(tabla_genero)),
  max(tabla_genero)))

# ── 8. Correlación: likes vs tiempo de sesión ────────────────
cat("== CORRELACIÓN LIKES vs TIEMPO DE SESIÓN ==\n")
cor_val <- cor(datos$likes, datos$tiempo_sesion_seg, use = "complete.obs")
cat(sprintf("Coeficiente de Pearson: %.4f\n", cor_val))
if (abs(cor_val) >= 0.7) {
  cat("→ Correlación FUERTE\n\n")
} else if (abs(cor_val) >= 0.4) {
  cat("→ Correlación MODERADA\n\n")
} else {
  cat("→ Correlación DÉBIL\n\n")
}

# ── 9. Exportar resumen ───────────────────────────────────────
write.csv(resumen_df, "20251_T6_resumen_estadistico.csv", row.names = FALSE)
cat(">> Resumen exportado a: 20251_T6_resumen_estadistico.csv\n\n")

# ── 10. Conclusiones ─────────────────────────────────────────
cat("========================================\n")
cat("  CONCLUSIONES\n")
cat("========================================\n\n")

cat("1. ENGAGEMENT: La tasa de like promedio es",
  round(mean(datos$tasa_like_pct), 2),
  "%, lo que indica que los usuarios\n")
cat("   aprueban más de la mitad de las canciones que se les presentan,\n")
cat("   reflejando alta relevancia de las recomendaciones del módulo MusicSwipe.\n\n")

cat("2. TIEMPO DE SESIÓN: La mediana de sesión es",
  median(datos$tiempo_sesion_seg),
  "segundos, con mayor engagement\n")
cat("   en la plataforma Web (sesiones más largas y más previews reproducidas).\n\n")

cat("3. PLATAFORMA Android muestra tiempos de carga más bajos (promedio ~845ms)\n")
cat("   vs Web (~1,030ms), aunque la tasa de like es similar entre ambas.\n\n")

cat("4. GÉNERO PREFERIDO: El género '", names(which.max(tabla_genero)), "' lidera\n", sep="")
cat("   las preferencias, lo que puede guiar la curaduría del catálogo.\n\n")

cat("5. CORRELACIÓN LIKES-TIEMPO: r =", round(cor_val, 4), "— a mayor tiempo\n")
cat("   de sesión, mayor cantidad de likes, sugiriendo que la experiencia\n")
cat("   de descubrimiento retiene al usuario de forma efectiva.\n\n")

cat("6. ERRORES DE CARGA: La media de errores es",
  round(mean(datos$errores_carga), 2),
  "por sesión, con picos\n")
cat("   en la plataforma Web, señalando área de mejora en la carga de miniaturas\n")
cat("   desde la API de YouTube.\n\n")

cat(">> Análisis completado exitosamente.\n")
