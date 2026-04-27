package com.example.moneymap.activities

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import com.example.moneymap.R
import com.example.moneymap.network.SupabaseClient
import io.github.jan.supabase.gotrue.gotrue
import io.github.jan.supabase.postgrest.postgrest
import kotlinx.coroutines.launch

class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        enableEdgeToEdge()
        setContentView(R.layout.activity_main)

        val tvUserEmail = findViewById<TextView>(R.id.tvUserEmail)
        val btnLogout = findViewById<Button>(R.id.btnLogout)

        setupInsets()

        // Display current user email
        val user = SupabaseClient.client.gotrue.currentUserOrNull()
        tvUserEmail.text = "Email: ${user?.email ?: "Not logged in"}"

        btnLogout.setOnClickListener {
            lifecycleScope.launch {
                try {
                    SupabaseClient.client.gotrue.signOut()
                    Toast.makeText(this@MainActivity, "Logged out", Toast.LENGTH_SHORT).show()
                    startActivity(Intent(this@MainActivity, LoginActivity::class.java))
                    finish()
                } catch (e: Exception) {
                    Log.e("LOGOUT_ERROR", e.message ?: "Unknown error")
                }
            }
        }

        // 🔗 Call Supabase to test database connection
        fetchTestData()
    }

    private fun setupInsets() {
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { view, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            view.setPadding(
                systemBars.left,
                systemBars.top,
                systemBars.right,
                systemBars.bottom
            )
            insets
        }
    }

    private fun fetchTestData() {
        lifecycleScope.launch {
            try {
                // Ensure there is a 'test' table in your Supabase database with 'id' and 'name' columns
                val result = SupabaseClient.client
                    .postgrest["test"]
                    .select()
                    .decodeList<TestItem>()

                Log.d("SUPABASE_SUCCESS", "Fetched ${result.size} items from 'test' table")
                for (item in result) {
                    Log.d("SUPABASE_SUCCESS", "Item: ID=${item.id}, Name=${item.name}")
                }

            } catch (e: Exception) {
                Log.e("SUPABASE_ERROR", "Database check failed: ${e.message}")
                // If the 'test' table doesn't exist, this will fail. 
                // That's expected if the DB isn't set up yet.
            }
        }
    }

    @kotlinx.serialization.Serializable
    data class TestItem(
        val id: Long,
        val name: String
    )
}