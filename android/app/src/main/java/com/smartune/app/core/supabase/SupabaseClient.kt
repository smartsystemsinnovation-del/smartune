package com.smartune.app.core.supabase

import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.gotrue.GoTrue
import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.storage.Storage
import io.github.jan.supabase.realtime.Realtime

object SupabaseClient {

    private const val SUPABASE_URL = "https://mpsmvszyzrtxwadmjuei.supabase.co"
    private const val SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wc212c3p5enJ0eHdhZG1qdWVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1MzY1NjAsImV4cCI6MjA4OTExMjU2MH0.FIdxI_ek02hfaE4lNe5bn8vcYs9-n-i1dT9k4OEVCU8"

    val client = createSupabaseClient(
        supabaseUrl = SUPABASE_URL,
        supabaseKey = SUPABASE_ANON_KEY
    ) {
        install(GoTrue) {
            scheme = "smartune-auth"
            host = "callback"
        }
        install(Postgrest)
        install(Storage)
        install(Realtime)
    }

    val auth get() = client.gotrue
    val db get() = client.postgrest
    val storage get() = client.storage
    val realtime get() = client.realtime
}
