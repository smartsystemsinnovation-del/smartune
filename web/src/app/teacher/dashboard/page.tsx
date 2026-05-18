import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import DashboardClient from '@/components/teacher/DashboardClient';

export default async function TeacherDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  // Verificar si es profesor
  const { data: userProfile } = await supabase
    .from('usuarios')
    .select('rol, nombre, avatar_url')
    .eq('id', user.id)
    .single();

  if (userProfile?.rol !== 'profesor') {
    redirect('/dashboard');
  }

  // Traer clases agendadas creadas por este profesor
  const { data: classes } = await supabase
    .from('classes')
    .select('*, student:usuarios!classes_student_id_fkey(nombre, correo, avatar_url)')
    .eq('teacher_id', user.id)
    .order('scheduled_at', { ascending: true });

  return (
    <DashboardClient
      classes={classes}
      teacherName={userProfile?.nombre || 'Profesor'}
      teacherAvatar={userProfile?.avatar_url}
    />
  );
}
