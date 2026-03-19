'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function connectWithTeacher(teacherId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'No estás autorizado. Inicia sesión primero.' }
  }

  // Verificar si ya existe una conexión
  const { data: existingConnection } = await supabase
    .from('student_teacher_connections')
    .select('id')
    .eq('student_id', user.id)
    .eq('teacher_id', teacherId)
    .single()

  if (existingConnection) {
    return { error: 'Ya estás conectado con este profesor.' }
  }

  const { error } = await supabase
    .from('student_teacher_connections')
    .insert({
      student_id: user.id,
      teacher_id: teacherId,
      status: 'accepted'
    })

  if (error) {
    console.error('Error connecting with teacher:', error)
    return { error: 'Hubo un problema al intentar conectar. Inténtalo de nuevo.' }
  }

  revalidatePath('/profesores')
  return { success: true }
}
