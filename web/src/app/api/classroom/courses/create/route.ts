import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { name, section, descriptionHeading } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'Falta el nombre del curso' }, { status: 400 });
    }

    const providerToken = session.provider_token;
    if (!providerToken) {
      return NextResponse.json({ 
        error: 'Falta permiso de Google Classroom. Por favor cierra sesión y vuelve a iniciar sesión.' 
      }, { status: 403 });
    }

    const courseData: any = { name, ownerId: 'me' };
    if (section) courseData.section = section;

    const classroomRes = await fetch('https://classroom.googleapis.com/v1/courses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${providerToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(courseData)
    });

    if (!classroomRes.ok) {
       const errBody = await classroomRes.text();
       console.error("Google Classroom API Error:", errBody);
       return NextResponse.json({ error: `Error al crear curso: ${classroomRes.statusText}` }, { status: classroomRes.status });
    }

    const createdCourse = await classroomRes.json();
    return NextResponse.json({ course: createdCourse, success: true });

  } catch (error: any) {
    console.error('Error en /api/classroom/courses/create:', error);
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 });
  }
}
