package com.example.antigravityidecompanion

import android.os.Bundle
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.compose.ui.text.style.TextAlign
import com.example.antigravityidecompanion.theme.AntigravityIDECompanionTheme

class MainActivity : ComponentActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()
    
    setContent {
      AntigravityIDECompanionTheme {
        Surface(
          modifier = Modifier.fillMaxSize(),
          color = Color(0xFF0A0A0B)
        ) {
          CompanionAppScreen()
        }
      }
    }
  }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CompanionAppScreen() {
  var serverIp by remember { mutableStateOf("192.168.1.142:5173") }
  var isConnected by remember { mutableStateOf(false) }

  if (isConnected) {
    // Fullscreen hardware-accelerated WebView companion shell
    AndroidView(
      modifier = Modifier.fillMaxSize(),
      factory = { context ->
        WebView(context).apply {
          settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
            loadWithOverviewMode = true
            useWideViewPort = true
            cacheMode = WebSettings.LOAD_DEFAULT
          }
          webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
              return false // Keeps navigation inside the companion app
            }
          }
          val url = if (serverIp.startsWith("http")) serverIp else "http://$serverIp"
          loadUrl(url)
        }
      }
    )
  } else {
    // Flat monochrome connection dashboard
    Box(
      modifier = Modifier
        .fillMaxSize()
        .background(Color(0xFF0A0A0B))
        .padding(24.dp),
      contentAlignment = Alignment.Center
    ) {
      Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
        modifier = Modifier.width(320.dp)
      ) {
        // Logo / Icon
        Box(
          modifier = Modifier
            .size(56.dp)
            .background(Color(0xFF111113), RoundedCornerShape(12.dp))
            .border(1.dp, Color(0xFF00FFCC).copy(alpha = 0.3f), RoundedCornerShape(12.dp)),
          contentAlignment = Alignment.Center
        ) {
          Text(
            text = "𝄐",
            color = Color(0xFF00FFCC),
            fontSize = 28.sp,
            fontWeight = FontWeight.Bold
          )
        }

        Spacer(modifier = Modifier.height(24.dp))

        Text(
          text = "ANTIGRAVITY COMPANION",
          color = Color(0xFFF3F3F5),
          fontSize = 15.sp,
          fontWeight = FontWeight.Bold,
          letterSpacing = 1.5.sp,
          fontFamily = FontFamily.SansSerif
        )

        Spacer(modifier = Modifier.height(8.dp))

        Text(
          text = "Scott's Pixel 10 Pro Sync Port",
          color = Color(0xFF8C8C99),
          fontSize = 11.sp,
          fontFamily = FontFamily.Monospace
        )

        Spacer(modifier = Modifier.height(32.dp))

        // Input Wrapper
        Column(
          horizontalAlignment = Alignment.Start,
          modifier = Modifier.fillMaxWidth()
        ) {
          Text(
            text = "HOST WORKSPACE ADDRESS (IP:PORT)",
            color = Color(0xFF52525B),
            fontSize = 9.sp,
            fontWeight = FontWeight.SemiBold,
            fontFamily = FontFamily.Monospace,
            modifier = Modifier.padding(bottom = 6.dp)
          )

          BasicTextField(
            value = serverIp,
            onValueChange = { serverIp = it },
            textStyle = TextStyle(
              color = Color(0xFFF3F3F5),
              fontFamily = FontFamily.Monospace,
              fontSize = 13.sp
            ),
            cursorBrush = SolidColor(Color(0xFF00FFCC)),
            modifier = Modifier
              .fillMaxWidth()
              .background(Color(0xFF111113), RoundedCornerShape(6.dp))
              .border(1.dp, Color(0xFF212124), RoundedCornerShape(6.dp))
              .padding(horizontal = 12.dp, vertical = 10.dp)
          )
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Pair button
        Button(
          onClick = { isConnected = true },
          colors = ButtonDefaults.buttonColors(
            containerColor = Color(0xFF00FFCC),
            contentColor = Color(0xFF0A0A0B)
          ),
          shape = RoundedCornerShape(6.dp),
          modifier = Modifier
            .fillMaxWidth()
            .height(44.dp)
        ) {
          Text(
            text = "CONNECT PEER SYNC",
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 1.sp
          )
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Info footer
        Text(
          text = "Pairing operates over local WiFi network.\nEnsure Windows host and Pixel 10 are synced.",
          color = Color(0xFF52525B),
          fontSize = 10.sp,
          lineHeight = 14.sp,
          textAlign = TextAlign.Center
        )
      }
    }
  }
}
