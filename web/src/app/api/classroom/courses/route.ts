import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const providerToken = session.provider_token;
    if (!providerToken) {
      return NextResponse.json({ 
        error: 'Falta permiso de Google Classroom. Por favor cierra sesión y vuelve a iniciar sesión con Google para autorizar.' 
      }, { status: 403 });
    }

    // Usando la Google Classroom API v1
    // courseStates=ACTIVE para solo traer cursos activos
    const classroomRes = await fetch('https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${providerToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!classroomRes.ok) {
       const errBody = await classroomRes.text();
       console.error("Google Classroom API Error:", errBody);
       return NextResponse.json({ error: `Error al obtener cursos: ${classroomRes.statusText}` }, { status: classroomRes.status });
    }

    const data = await classroomRes.json();
    const courses = data.courses || [];

    return NextResponse.json({ courses, success: true });
  } catch (error: any) {
    console.error('Error en /api/classroom/courses:', error);
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 });
  }
}
