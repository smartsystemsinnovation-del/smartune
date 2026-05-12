import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { JWT } from "npm:google-auth-library@9.0.0"

serve(async (req) => {
  try {
    // 1. Obtener datos del trigger (que hace el POST)
    const { fcm_token, title, body } = await req.json()

    if (!fcm_token) throw new Error('Missing fcm_token')

    // 2. Obtener las credenciales de Firebase desde los secretos de Supabase
    const serviceAccountStr = Deno.env.get('FIREBASE_SERVICE_ACCOUNT')
    if (!serviceAccountStr) throw new Error('Falta el secreto FIREBASE_SERVICE_ACCOUNT')

    const serviceAccount = JSON.parse(serviceAccountStr)

    // 3. Generar token de acceso OAuth2 para la API de Google
    const client = new JWT({
      email: serviceAccount.client_email,
      key: serviceAccount.private_key,
      scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
    })

    const accessToken = await client.getAccessToken()

    // 4. Enviar notificación usando FCM v1 API
    const response = await fetch(`https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken.token}`,
      },
      body: JSON.stringify({
        message: {
          token: fcm_token,
          notification: {
            title: title,
            body: body,
          }
        }
      })
    })

    const resData = await response.json()

    return new Response(JSON.stringify({ success: true, fcm_response: resData }), {
      headers: { "Content-Type": "application/json" }
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 400, 
      headers: { "Content-Type": "application/json" } 
    })
  }
})
