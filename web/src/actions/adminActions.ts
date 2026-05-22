'use server'

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export interface PendingApplication {
  id: string;
  user_id: string;
  document_title: string;
  document_type: string;
  issuing_institution: string;
  document_url: string;
  status: string;
  created_at: string;
  usuarios: {
    nombre: string;
    correo: string;
  };
}

export interface ApplicationFilters {
  nombre?: string;
  certifica?: string;
  escuela?: string;
  fecha?: string;
}

/**
 * Obtiene las solicitudes de profesores pendientes aplicando filtros dinámicos.
 */
export async function getPendingApplications(filters: ApplicationFilters) {
  try {
    const supabase = await createClient();
    
    // Validar que el usuario actual sea administrador
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    const { data: profile } = await supabase
      .from('usuarios')
      .select('rol')
      .eq('id', user.id)
      .single();

    if (profile?.rol !== 'administrador') {
      return { success: false, error: 'No tienes permisos de administrador' };
    }

    // Consulta básica con unión inner para traer datos del aplicante
    let query = supabase
      .from('teacher_applications')
      .select('*, usuarios!inner(nombre, correo)')
      .eq('status', 'pending');

    // Filtros dinámicos
    if (filters.nombre) {
      query = query.ilike('usuarios.nombre', `%${filters.nombre}%`);
    }
    if (filters.certifica) {
      query = query.ilike('document_title', `%${filters.certifica}%`);
    }
    if (filters.escuela) {
      query = query.ilike('issuing_institution', `%${filters.escuela}%`);
    }
    if (filters.fecha) {
      const startOfDay = `${filters.fecha}T00:00:00.000Z`;
      const endOfDay = `${filters.fecha}T23:59:59.999Z`;
      query = query.gte('created_at', startOfDay).lte('created_at', endOfDay);
    }

    // Ordenar por fecha más reciente
    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Error al consultar solicitudes:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as PendingApplication[] };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Aprueba una postulación de profesor.
 */
export async function approveTeacherApplication(applicationId: string, userId: string) {
  try {
    const supabase = await createClient();
    
    // Validar permisos
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'No autenticado' };
    
    const { data: profile } = await supabase
      .from('usuarios')
      .select('rol')
      .eq('id', user.id)
      .single();

    if (profile?.rol !== 'administrador') {
      return { success: false, error: 'No tienes permisos de administrador' };
    }

    // 1. Actualizar la solicitud a aprobada
    const { error: appError } = await supabase
      .from('teacher_applications')
      .update({ status: 'approved' })
      .eq('id', applicationId);

    if (appError) throw appError;

    // 2. Actualizar el rol en la tabla usuarios a 'profesor'
    const { error: userError } = await supabase
      .from('usuarios')
      .update({ rol: 'profesor' })
      .eq('id', userId);

    if (userError) throw userError;

    // 3. Upsertar registro en la tabla profesores como 'verificado'
    const { error: profError } = await supabase
      .from('profesores')
      .upsert({ id: userId, estado_verificacion: 'verificado' }, { onConflict: 'id' });

    if (profError) throw profError;

    // 4. Insertar notificación interactiva para el usuario
    const { error: notifError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: '¡Postulación Aprobada! 🎉',
        body: 'Tu certificado ha sido validado. ¡Bienvenido a SmarTune como Profesor!',
        type: 'system',
        read: false,
        data: { approved: true }
      });

    if (notifError) {
      console.warn("No se pudo registrar notificación in-app:", notifError.message);
    }

    revalidatePath('/admin/solicitudes');
    return { success: true };
  } catch (error: any) {
    console.error('Error al aprobar solicitud:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Rechaza una postulación de profesor especificando el motivo.
 */
export async function rejectTeacherApplication(applicationId: string, userId: string, reason: string) {
  try {
    const supabase = await createClient();
    
    // Validar permisos
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'No autenticado' };
    
    const { data: profile } = await supabase
      .from('usuarios')
      .select('rol')
      .eq('id', user.id)
      .single();

    if (profile?.rol !== 'administrador') {
      return { success: false, error: 'No tienes permisos de administrador' };
    }

    // 1. Actualizar la solicitud a rechazada
    const { error: appError } = await supabase
      .from('teacher_applications')
      .update({ status: 'rejected' })
      .eq('id', applicationId);

    if (appError) throw appError;

    // 2. Regresar el rol del usuario a 'estudiante'
    const { error: userError } = await supabase
      .from('usuarios')
      .update({ rol: 'estudiante' })
      .eq('id', userId);

    if (userError) throw userError;

    // 3. Registrar el estado en la tabla profesores como 'rechazado'
    const { error: profError } = await supabase
      .from('profesores')
      .upsert({ id: userId, estado_verificacion: 'rechazado' }, { onConflict: 'id' });

    if (profError) throw profError;

    // 4. Enviar notificación explicativa
    const { error: notifError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: 'Postulación de Profesor ❌',
        body: `Tu solicitud no pudo ser aprobada: ${reason}. Por favor, vuelve a subir tu certificado.`,
        type: 'system',
        read: false,
        data: { approved: false, reason }
      });

    if (notifError) {
      console.warn("No se pudo registrar la notificación de rechazo:", notifError.message);
    }

    revalidatePath('/admin/solicitudes');
    return { success: true };
  } catch (error: any) {
    console.error('Error al rechazar solicitud:', error);
    return { success: false, error: error.message };
  }
}
