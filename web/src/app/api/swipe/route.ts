import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { swipeSchema } from '@/domain/validators/userSchemas';

// Temporary counters for views/discards (since they are less critical than likes)
let interactionCounts = {
  likes: 0,
  views: 0,
  discards: 0,
};

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('favoritos')
      .select('*')
      .eq('usuario_id', user.id)
      .order('fecha_like', { ascending: false });

    if (error) throw error;

    // Map back to the frontend format
    const songs = data.map(fav => ({
      id: fav.youtube_id,
      title: fav.titulo,
      artist: fav.artista,
      coverUrl: fav.cover_url
    }));

    return NextResponse.json(songs);
  } catch (error: any) {
    console.error('API ERROR /api/swipe GET:', error.message);
    return NextResponse.json({ error: 'Ocurrió un error general en el servidor.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.json();
    const parsed = swipeSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Input inválido', details: parsed.error.issues }, { status: 400 });
    }

    const { song, action } = parsed.data;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    interactionCounts.views += 1;

    if (action === 'like') {
      interactionCounts.likes += 1;
      
      const { error } = await supabase
        .from('favoritos')
        .upsert({
          usuario_id: user.id,
          youtube_id: song!.id,
          titulo: song!.title,
          artista: song!.artist,
          cover_url: song!.coverUrl
        }, { onConflict: 'usuario_id,youtube_id' });

      if (error) throw error;
    } else {
      interactionCounts.discards += 1;
    }

    return NextResponse.json({ 
      success: true, 
      counts: interactionCounts 
    });
  } catch (error: any) {
    console.error('API ERROR /api/swipe POST:', error.message);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function PATCH() {
  return NextResponse.json(interactionCounts);
}
