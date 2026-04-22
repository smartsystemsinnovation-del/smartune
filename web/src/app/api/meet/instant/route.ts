import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    
    // Verificación segura (Activa contra BD)
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Segunda llamada para extraer el token (ahora protegido)
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado (Sin sesión)' }, { status: 401 });
    }

    const { targetUserId } = await req.json();
    if (!targetUserId) {
      return NextResponse.json({ error: 'Falta targetUserId' }, { status: 400 });
    }

    const providerToken = session.provider_token;
    if (!providerToken) {
      return NextResponse.json({ error: 'Se requiere iniciar sesión con Google para generar llamadas instantáneas (Falta provider_token).' }, { status: 403 });
    }

    // Usando la nueva Google Meet REST API v2
    const meetRes = await fetch('https://meet.googleapis.com/v2/spaces', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${providerToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        config: {
          accessType: 'OPEN',
        }
      })
    });

    if (!meetRes.ok) {
       const errBody = await meetRes.text();
       console.error("Google Meet API Error:", errBody);
       throw new Error(`Error al generar el Meet: ${meetRes.statusText}`);
    }

    const spaceData = await meetRes.json();
    const meetLink = spaceData.meetingUri; 

    return NextResponse.json({ meetLink, success: true });
  } catch (error: any) {
    console.error('Error en /api/meet/instant:', error);
    return NextResponse.json({ error: 'Ocurrió un error general en el servidor.' }, { status: 500 });
  }
}
