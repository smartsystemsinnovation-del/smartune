package com.smartune.app.core.fcm

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import com.smartune.app.MainActivity
import com.smartune.app.R
import com.smartune.app.explorar.data.repository.SocialRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class FCMService : FirebaseMessagingService() {

    private val socialRepository = SocialRepository()

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        // Enviar el nuevo token a Supabase
        CoroutineScope(Dispatchers.IO).launch {
            try {
                socialRepository.updateFcmToken(token)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    override fun onMessageReceived(message: RemoteMessage) {
        super.onMessageReceived(message)

        // Manejar notificaciones cuando la app está en foreground (primer plano)
        message.notification?.let {
            showNotification(it.title, it.body)
        }
    }

    private fun showNotification(title: String?, body: String?) {
        val intent = Intent(this, MainActivity::class.java)
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_ONE_SHOT or PendingIntent.FLAG_IMMUTABLE
        )

        val channelId = "smartune_general"
        val notificationBuilder = NotificationCompat.Builder(this, channelId)
            // .setSmallIcon(R.mipmap.ic_launcher) // Asegúrate de tener un icono de notificación válido
            .setContentTitle(title)
            .setContentText(body)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            // Usa el ícono por defecto por ahora. Podrías querer cambiarlo por R.drawable.ic_notification si creas uno
            .setSmallIcon(android.R.drawable.ic_dialog_info) 

        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "General Notifications",
                NotificationManager.IMPORTANCE_DEFAULT
            )
            notificationManager.createNotificationChannel(channel)
        }

        notificationManager.notify(0, notificationBuilder.build())
    }
}
