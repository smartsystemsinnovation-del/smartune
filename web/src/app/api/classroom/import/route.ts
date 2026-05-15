import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { studentIds } = await req.json();

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json({ error: 'Falta la lista de estudiantes (studentIds)' }, { status: 400 });
    }

    const teacherId = session.user.id;

    // 1. Obtener las conexiones actuales para evitar intentar insertar duplicados
    const { data: existingConns, error: fetchError } = await supabase
      .from('student_teacher_connections')
      .select('student_id')
      .eq('teacher_id', teacherId)
      .in('student_id', studentIds);

    if (fetchError) {
      console.error('Error al verificar conexiones existentes:', fetchError);
      return NextResponse.json({ error: 'Error al verificar conexiones' }, { status: 500 });
    }

    const existingIds = existingConns.map(c => c.student_id);
    const newStudentIds = studentIds.filter(id => !existingIds.includes(id));

    if (newStudentIds.length === 0) {
      return NextResponse.json({ success: true, message: 'Todos los estudiantes ya estaban vinculados.' });
    }

    // 2. Preparar los datos para insertar
    const insertData = newStudentIds.map(studentId => ({
      teacher_id: teacherId,
      student_id: studentId,
      status: 'accepted' // Para Classroom asumimos que el profesor los acepta directamente
    }));

    // 3. Insertar las nuevas conexiones
    const { error: insertError } = await supabase
      .from('student_teacher_connections')
      .insert(insertData);

    if (insertError) {
      console.error('Error al insertar conexiones:', insertError);
      return NextResponse.json({ error: 'Error al vincular estudiantes' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Se vincularon ${newStudentIds.length} estudiantes correctamente.` 
    });

  } catch (error: any) {
    console.error('Error en /api/classroom/import:', error);
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 });
  }
}
