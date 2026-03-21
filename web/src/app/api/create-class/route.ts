import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { google } from 'googleapis';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { teacherId, studentId, title, description, scheduledAt } = body;

    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || session.user.id !== teacherId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener correo del alumno para agregarlo como invitado oficial al evento
    const { data: studentProfile } = await supabase
      .from('usuarios')
      .select('correo')
      .eq('id', studentId)
      .single();

    const providerToken = session.provider_token;

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

    // 2. Transacción de Base de Datos
    const { data: clase, error: insertError } = await supabase
      .from('classes')
      .insert({
        teacher_id: teacherId,
        student_id: studentId,
        title,
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
