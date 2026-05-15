import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json({ error: 'Falta el parámetro courseId' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const providerToken = session.provider_token;
    if (!providerToken) {
      return NextResponse.json({ 
        error: 'Falta permiso de Google Classroom. Por favor cierra sesión y vuelve a iniciar sesión.' 
      }, { status: 403 });
    }

    // 1. Obtener los estudiantes del curso desde la API de Google Classroom
    const classroomRes = await fetch(`https://classroom.googleapis.com/v1/courses/${courseId}/students`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${providerToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!classroomRes.ok) {
       const errBody = await classroomRes.text();
       console.error("Google Classroom API Error:", errBody);
       return NextResponse.json({ error: `Error al obtener alumnos: ${classroomRes.statusText}` }, { status: classroomRes.status });
    }

    const data = await classroomRes.json();
    const googleStudents = data.students || [];

    if (googleStudents.length === 0) {
      return NextResponse.json({ students: [], success: true });
    }

    // Extraer correos
    const emails = googleStudents
      .map((s: any) => s.profile?.emailAddress)
      .filter((email: string | undefined) => email !== undefined);

    // 2. Buscar en Supabase qué correos ya están registrados
    let registeredUsers: any[] = [];
    if (emails.length > 0) {
      const { data: dbUsers, error: dbError } = await supabase
        .from('usuarios')
        .select('id, nombre, correo, avatar_url')
        .in('correo', emails);

      if (dbError) {
        console.error("Error consultando usuarios:", dbError);
      } else if (dbUsers) {
        registeredUsers = dbUsers;
      }
    }

    // 3. Obtener conexiones existentes para evitar sugerir vincular a alguien que ya lo está
    let existingConnections: any[] = [];
    if (registeredUsers.length > 0) {
      const registeredIds = registeredUsers.map(u => u.id);
      const { data: connData, error: connError } = await supabase
        .from('student_teacher_connections')
        .select('student_id')
        .eq('teacher_id', session.user.id)
        .in('student_id', registeredIds);
      
      if (!connError && connData) {
        existingConnections = connData.map(c => c.student_id);
      }
    }

    // 4. Combinar la información
    const combinedStudents = googleStudents.map((gs: any) => {
      const email = gs.profile?.emailAddress;
      const matchedUser = registeredUsers.find(u => u.correo === email);
      const isAlreadyConnected = matchedUser ? existingConnections.includes(matchedUser.id) : false;

      return {
        googleId: gs.userId,
        name: gs.profile?.name?.fullName || 'Desconocido',
        email: email,
        photoUrl: gs.profile?.photoUrl,
        isRegistered: !!matchedUser,
        isAlreadyConnected: isAlreadyConnected,
        smartuneId: matchedUser ? matchedUser.id : null,
      };
    });

    // 5. Obtener alumnos de la red de SmarTune del profesor
    const { data: networkData } = await supabase
      .from('student_teacher_connections')
      .select('student_id, usuarios!student_teacher_connections_student_id_fkey(id, nombre, correo, avatar_url)')
      .eq('teacher_id', session.user.id)
      .eq('status', 'accepted');

    const networkStudents = [];
    if (networkData) {
      for (const conn of networkData) {
        const user = Array.isArray(conn.usuarios) ? conn.usuarios[0] : conn.usuarios;
        if (user) {
          // Verificar si ya está en Classroom (por email)
          if (!emails.includes(user.correo)) {
            networkStudents.push({
              smartuneId: user.id,
              name: user.nombre,
              email: user.correo,
              photoUrl: user.avatar_url,
            });
          }
        }
      }
    }

    return NextResponse.json({ students: combinedStudents, networkStudents, success: true });
  } catch (error: any) {
    console.error('Error en /api/classroom/students:', error);
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 });
  }
}
