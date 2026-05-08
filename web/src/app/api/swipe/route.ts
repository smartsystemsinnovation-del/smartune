import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { song, action } = body;
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
          youtube_id: song.id,
          titulo: song.title,
          artista: song.artist,
          cover_url: song.coverUrl
        }, { onConflict: 'usuario_id,youtube_id' });

      if (error) throw error;
    } else {
      interactionCounts.discards += 1;
    }

    // Fetch updated like count from DB
    const { count: likeCount } = await supabase
      .from('favoritos')
      .select('*', { count: 'exact', head: true })
      .eq('usuario_id', user.id);

    return NextResponse.json({ 
      success: true, 
      counts: {
        likes: likeCount || 0,
        views: interactionCounts.views,
        discards: interactionCounts.discards
      } 
    });
  } catch (error: any) {
    console.error('API ERROR /api/swipe POST:', error.message);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function PATCH() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { count: likeCount } = await supabase
      .from('favoritos')
      .select('*', { count: 'exact', head: true })
      .eq('usuario_id', user.id);

    return NextResponse.json({
      likes: likeCount || 0,
      views: interactionCounts.views,
      discards: interactionCounts.discards
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
