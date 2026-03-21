package com.smartune.app

import android.app.Application

class SmarTuneApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        // Supabase client is initialized lazily via the singleton object
    }
}
