import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { google } from 'googleapis';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { teacherId, studentId, title, instrument, description, scheduledAt } = body;

    const supabase = await createClient();
    let { data: { session } } = await supabase.auth.getSession();
    
    let sessionUser = session?.user;
    let providerToken = session?.provider_token || body.providerToken;

    // Fallback para Mobile: extraer sesión manual desde Bearer token si no hay cookies
    if (!sessionUser) {
      const authHeader = req.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabase.auth.getUser(token);
        sessionUser = user ?? undefined;
      }
    }

    if (!sessionUser || sessionUser.id !== teacherId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener correo del alumno para agregarlo como invitado oficial al evento
    const { data: studentProfile } = await supabase
      .from('usuarios')
      .select('correo')
      .eq('id', studentId)
      .single();

    let meetLink = '';
    
    // Configuración de Google Calendar API v3 vía REST (Feature A: Scheduled)
    try {
      if (!providerToken) {
        console.warn("⚠️ No Provider Token found. El usuario necesita Iniciar Sesión con Google para generar el Meet.");
      } else {
        const eventBody: any = {
          summary: title,
          description: description,
          start: {
            dateTime: scheduledAt,
            timeZone: 'UTC',
          },
          end: {
            // Asumimos 1 hora completa de duración de la masterclass
            dateTime: new Date(new Date(scheduledAt).getTime() + 60 * 60 * 1000).toISOString(),
            timeZone: 'UTC',
          },
          conferenceData: {
            createRequest: {
              requestId: crypto.randomUUID(),
              conferenceSolutionKey: { type: 'hangoutsMeet' }
            }
          }
        };

        // Si tenemos el correo del alumno, lo añadimos como invitado para que Meet lo deje entrar directo
        if (studentProfile?.correo) {
          eventBody.attendees = [
            { email: studentProfile.correo }
          ];
        }

        const gCaleRes = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${providerToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(eventBody)
        });

        if (!gCaleRes.ok) {
           const errText = await gCaleRes.text();
           throw new Error(`Google Calendar API error: ${errText}`);
        }

        const calData = await gCaleRes.json();
        meetLink = calData.hangoutLink || '';
      }
    } catch (apiError: any) {
      console.warn("⚠️ ERROR GOOGLE API:", apiError.message);
      return NextResponse.json({ 
        error: 'Error conectando con Google Calendar. Por favor, cierra sesión y vuelve a entrar con Google para renovar permisos.', 
        details: apiError.message 
      }, { status: 500 });
    }

    // 2. Establecer la conexión automáticamente si no existe (al ser el profesor quien lo busca globalmente)
    const { error: connError } = await supabase
      .from('student_teacher_connections')
      .insert({
        teacher_id: teacherId,
        student_id: studentId,
        status: 'accepted'
      });
      // El error de llave duplicada se ignora porque la conexión ya existe
    if (connError && connError.code !== '23505') {
       console.warn("Error creando conexión automática:", connError);
    }

    // 3. Transacción de Base de Datos para la clase
    const { data: clase, error: insertError } = await supabase
      .from('classes')
      .insert({
        teacher_id: teacherId,
        student_id: studentId,
        title,
        instrument,
        description,
        scheduled_at: scheduledAt,
        meet_link: meetLink,
        status: 'scheduled'
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error BD:", insertError);
      return NextResponse.json({ error: 'Error al agendar la clase en el directorio.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, clase });

  } catch (error: any) {
    console.error("Error general API Route:", error);
    return NextResponse.json({ error: 'Intercepción de falla en el servidor', details: error.message }, { status: 500 });
  }
}
