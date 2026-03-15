'use server'

import { createClient } from '@/utils/supabase/server';

/**
 * Fetch "Tareas del Día" (Scheduled practices strictly due today or earlier).
 * Querying elements where proxima_practica <= NOW() for the given user.
 */
export async function getDailyTasks(userId: string) {
  try {
    const supabase = await createClient();
    const today = new Date().toISOString();
    const { data, error } = await supabase
      .from('historial_usuario')
      .select(`
        id,
        cancion_id,
        repeticiones,
        proxima_practica,
        canciones ( titulo, artista, dificultad )
      `)
      .eq('usuario_id', userId)
      .lte('proxima_practica', today)
      .order('proxima_practica', { ascending: true });

    if (error) {
      console.error('Error fetching daily tasks:', error);
      return { success: false, error: error.message };
    }

    return { success: true, count: data?.length || 0, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Upload a song file (PDF/Audio) directly to Supabase Storage.
 * Creates the corresponding entry in `cancion_archivos` in a 'pendiente' state 
 * for administrative moderation as per RLS.
 */
export async function uploadSongFile(formData: FormData) {
  try {
    const supabase = await createClient();
    const file = formData.get('file') as File;
    const authorId = formData.get('authorId') as string;
    const songId = formData.get('songId') as string;
    const fileType = formData.get('fileType') as string; // 'tab', 'audio', 'video'

    if (!file || !authorId || !songId) {
      return { success: false, error: 'Missing required parameters' };
    }

    const fileExt = file.name.split('.').pop();
    const filePath = `uploads/${songId}/${authorId}_${Date.now()}.${fileExt}`;

    // 1. Upload file to Storage Bucket 'smartune-files'
    const { error: uploadError } = await supabase.storage
      .from('smartune-files')
      .upload(filePath, file);

    if (uploadError) {
      return { success: false, error: uploadError.message };
    }

    // 2. Insert into the database as 'pendiente' (handled by default value & RLS)
    const { data: dbData, error: dbError } = await supabase
      .from('cancion_archivos')
      .insert({
        cancion_id: songId,
        autor_id: authorId,
        tipo_archivo: fileType,
        url_archivo: filePath
      })
      .select()
      .single();

    if (dbError) {
       return { success: false, error: dbError.message };
    }

    return { success: true, data: dbData };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
