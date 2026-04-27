package com.example.moneymap.network

import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.gotrue.GoTrue
import io.github.jan.supabase.postgrest.Postgrest

object SupabaseClient {

    val client = createSupabaseClient(
        supabaseUrl = "https://csorrcbemssfhwjmuxih.supabase.co",
        supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzb3JyY2JlbXNzZmh3am11eGloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4NzUyNjUsImV4cCI6MjA4ODQ1MTI2NX0.arKg6Wa8Ct0STJg09p94NnwPXA7LXiVB6WALPhMnNVQ"
    ) {
        install(Postgrest)
        install(GoTrue)
    }
}