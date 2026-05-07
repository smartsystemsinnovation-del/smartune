import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { teacherId } = body;

    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const studentId = session.user.id;

    // Insertar conexión
    const { data, error } = await supabase
      .from('student_teacher_connections')
      .insert({
        student_id: studentId,
        teacher_id: teacherId,
        status: 'accepted'
      })
      .select()
      .single();

    if (error) {
      // Check for duplicate key violation
      if (error.code === '23505') {
        return NextResponse.json({ success: true, message: 'Ya estabas conectado con este profesor.' });
      }
      console.error("Error BD:", error);
      return NextResponse.json({ error: 'Error al conectar con el profesor.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, connection: data });

  } catch (error: any) {
    console.error("Error general API Route:", error);
    return NextResponse.json({ error: 'Intercepción de falla en el servidor', details: error.message }, { status: 500 });
  }
}
