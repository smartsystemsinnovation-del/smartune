package com.smartune.app.core.supabase

import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.gotrue.Auth
import io.github.jan.supabase.gotrue.auth
import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.postgrest.postgrest
import io.github.jan.supabase.storage.Storage
import io.github.jan.supabase.storage.storage
import io.github.jan.supabase.realtime.Realtime
import io.github.jan.supabase.realtime.realtime

import io.github.jan.supabase.serializer.KotlinXSerializer
import kotlinx.serialization.json.Json

object SupabaseClient {
    private const val SUPABASE_URL = "https://mpsmvszyzrtxwadmjuei.supabase.co"
    private const val SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wc212c3p5enJ0eHdhZG1qdWVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1MzY1NjAsImV4cCI6MjA4OTExMjU2MH0.FIdxI_ek02hfaE4lNe5bn8vcYs9-n-i1dT9k4OEVCU8"

    val client = createSupabaseClient(
        supabaseUrl = SUPABASE_URL,
        supabaseKey = SUPABASE_ANON_KEY
    ) {
        defaultSerializer = KotlinXSerializer(Json { ignoreUnknownKeys = true })
        install(Auth) {
            scheme = "smartune-auth"
            host = "callback"
            autoLoadFromStorage = true
        }
        install(Postgrest)
        install(Storage)
        install(Realtime)
    }


    val auth get() = client.auth
    val db get() = client.postgrest
    val storage get() = client.storage
    val realtime get() = client.realtime
}
