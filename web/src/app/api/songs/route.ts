import { NextResponse } from 'next/server';
import { fetchYouTubeSongs } from '@/utils/youtube';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const genre = searchParams.get('genre') || undefined;
    
    // 1. Fetch random top hits from YouTube
    let songs = await fetchYouTubeSongs(genre);

    // 2. Fetch user's saved favorites to prevent duplicates
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: favs } = await supabase
        .from('favoritos')
        .select('youtube_id')
        .eq('usuario_id', user.id);
        
      if (favs && favs.length > 0) {
        const savedIds = favs.map(f => f.youtube_id);
        // 3. Filter out songs the user already liked/saved
        songs = songs.filter((song: any) => !savedIds.includes(song.id));
      }
    }

    return NextResponse.json(songs);
  } catch (error: any) {
    console.error('CRITICAL API ERROR /api/songs:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
