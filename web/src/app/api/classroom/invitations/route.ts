import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { courseId, emails } = await req.json();

    if (!courseId || !emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ error: 'Faltan parámetros (courseId o emails)' }, { status: 400 });
    }

    const providerToken = session.provider_token;
    if (!providerToken) {
      return NextResponse.json({ 
        error: 'Falta permiso de Google Classroom. Por favor cierra sesión y vuelve a iniciar sesión.' 
      }, { status: 403 });
    }

    const results = [];
    let hasErrors = false;

    // Enviar invitación por cada email
    for (const email of emails) {
      const inviteData = {
        userId: email,
        courseId: courseId,
        role: 'STUDENT'
      };

      const classroomRes = await fetch('https://classroom.googleapis.com/v1/invitations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${providerToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(inviteData)
      });

      if (!classroomRes.ok) {
        const errBody = await classroomRes.text();
        console.error(`Error al invitar a ${email}:`, errBody);
        results.push({ email, success: false, error: classroomRes.statusText });
        hasErrors = true;
      } else {
        const data = await classroomRes.json();
        results.push({ email, success: true, data });
      }
    }

    if (hasErrors) {
       // Si hubo errores pero algunos pasaron, informamos de un estado mixto
       return NextResponse.json({ 
         error: 'Hubo errores al invitar a algunos alumnos. Verifica que los correos sean de cuentas de Google válidas.',
         results 
       }, { status: 207 }); // 207 Multi-Status
    }

    return NextResponse.json({ 
      success: true, 
      message: `Se enviaron ${emails.length} invitaciones correctamente.`,
      results
    });

  } catch (error: any) {
    console.error('Error en /api/classroom/invitations:', error);
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 });
  }
}
