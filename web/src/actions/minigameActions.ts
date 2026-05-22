'use server'

import { createClient } from '@/utils/supabase/server';

/**
 * Guarda el resultado/estadística de un minijuego en la base de datos.
 */
export async function saveMinigameStat(
  gameId: string, 
  score: number, 
  accuracy: number | null, 
  difficulty: string | null
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    const { data, error } = await supabase
      .from('minigame_stats')
      .insert({
        user_id: user.id,
        game_id: gameId,
        score: score,
        accuracy: accuracy,
        difficulty: difficulty,
        shared: false // Inicia como falso para respetar la privacidad por defecto
      })
      .select()
      .single();

    if (error) {
      console.error('Error al guardar estadística de minijuego:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Cambia el estado de compartición de una estadística específica.
 */
export async function toggleStatSharing(statId: string, shared: boolean) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    const { data, error } = await supabase
      .from('minigame_stats')
      .update({ shared })
      .eq('id', statId)
      .eq('user_id', user.id) // Seguridad extra: asegurar que sea del propio usuario
      .select()
      .single();

    if (error) {
      console.error('Error al cambiar estado de compartición:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Obtiene todas las estadísticas del alumno autenticado actual.
 */
export async function getStudentStats() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    const { data, error } = await supabase
      .from('minigame_stats')
      .select('*')
      .eq('user_id', user.id)
      .order('played_at', { ascending: false });

    if (error) {
      console.error('Error al obtener estadísticas del alumno:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Obtiene los alumnos conectados con el profesor autenticado actual y sus estadísticas compartidas.
 */
export async function getTeacherStudentsStats() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    // 1. Obtener las conexiones aceptadas
    const { data: connections, error: connError } = await supabase
      .from('student_teacher_connections')
      .select('student_id, student:usuarios!student_teacher_connections_student_id_fkey(nombre, correo, avatar_url)')
      .eq('teacher_id', user.id)
      .eq('status', 'accepted');

    if (connError) {
      console.error('Error al obtener conexiones de alumnos:', connError);
      return { success: false, error: connError.message };
    }

    if (!connections || connections.length === 0) {
      return { success: true, students: [], stats: [] };
    }

    const studentIds = connections.map(c => c.student_id);

    // 2. Obtener las estadísticas compartidas de esos alumnos
    const { data: stats, error: statsError } = await supabase
      .from('minigame_stats')
      .select('*, student:usuarios!minigame_stats_user_id_fkey(nombre, correo, avatar_url)')
      .in('user_id', studentIds)
      .eq('shared', true)
      .order('played_at', { ascending: false });

    if (statsError) {
      console.error('Error al obtener estadísticas compartidas de alumnos:', statsError);
      return { success: false, error: statsError.message };
    }

    // Mapear los alumnos únicos
    const studentsMap = new Map();
    connections.forEach(c => {
      const std = Array.isArray(c.student) ? c.student[0] : c.student;
      if (std) {
        studentsMap.set(c.student_id, {
          id: c.student_id,
          nombre: std.nombre,
          correo: std.correo,
          avatar_url: std.avatar_url
        });
      }
    });

    return { 
      success: true, 
      students: Array.from(studentsMap.values()), 
      stats 
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
