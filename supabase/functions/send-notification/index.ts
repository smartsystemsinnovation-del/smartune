import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { JWT } from "npm:google-auth-library@9.0.0"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Parse request body
    const { fcm_token, title, body, user_id } = await req.json()

    if (!fcm_token || !title || !body) {
      throw new Error('Missing required fields: fcm_token, title, body')
    }

    // 2. Get Firebase service account from Supabase secret
    const serviceAccountStr = Deno.env.get('FIREBASE_SERVICE_ACCOUNT')
    if (!serviceAccountStr) throw new Error('Missing secret: FIREBASE_SERVICE_ACCOUNT')

    const serviceAccount = JSON.parse(serviceAccountStr)

    // 3. Generate OAuth2 access token using google-auth-library
    const client = new JWT({
      email: serviceAccount.client_email,
      key: serviceAccount.private_key,
      scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
    })

    const tokenResponse = await client.getAccessToken()
    const accessToken = tokenResponse.token

    if (!accessToken) throw new Error('Failed to get Firebase access token')

    // 4. Send FCM v1 API push notification
    const fcmResponse = await fetch(
      `https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          message: {
            token: fcm_token,
            notification: {
              title: title,
              body: body,
            },
            android: {
              notification: {
                sound: 'default',
                channel_id: 'smartune_general',
                priority: 'HIGH',
              }
            }
          }
        })
      }
    )

    const fcmData = await fcmResponse.json()

    if (!fcmResponse.ok) {
      throw new Error(`FCM Error: ${JSON.stringify(fcmData)}`)
    }

    return new Response(
      JSON.stringify({ success: true, message_id: fcmData.name }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('send-notification error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
