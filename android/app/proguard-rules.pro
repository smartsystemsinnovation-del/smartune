# ==============================================================================
# PROGUARD RULES PARA SMARTUNE ANDROID
# ==============================================================================

# Ktor y Coroutines (Network & Asynchronous)
-keep class io.ktor.** { *; }
-keepclassmembers class io.ktor.** { *; }
-keep class kotlinx.coroutines.** { *; }

# Kotlinx Serialization (Para los Modelos de Datos en red)
-keepattributes *Annotation*, InnerClasses
-dontnote kotlinx.serialization.AnnotationsKd
-keep,allowoptimization class kotlinx.serialization.** { *; }
-keepclassmembers class kotlinx.serialization.** { *; }
-keep @kotlinx.serialization.Serializable class * { *; }

# Supabase (BaaS, Auth y Storage)
-keep class io.github.jan.supabase.** { *; }
-keepclassmembers class io.github.jan.supabase.** { *; }

# Modelos y Clases de Datos Protegidas (Para evitar falla del Decoder)
-keep class com.smartune.app.core.network.model.** { *; }
-keep class com.smartune.app.home.data.repository.** { *; }

# Compose UI, Navigation y Material
-keep class androidx.compose.** { *; }
-keep class androidx.navigation.** { *; }

# AndroidX Core, Lifecycle y Compatibilidad General
-keep class androidx.lifecycle.** { *; }
-keep class androidx.core.** { *; }
-dontwarn androidx.**
-dontwarn kotlinx.**
-dontwarn io.ktor.**
-dontwarn io.github.jan.supabase.**
