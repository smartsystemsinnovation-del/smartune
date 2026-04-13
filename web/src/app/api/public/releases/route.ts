import { NextResponse } from 'next/server';
import { fetchYouTubeSongs } from '@/utils/youtube';

export const revalidate = 3600; // Cache for 1 hour to deeply save API Quota

export async function GET() {
  try {
    // We search for trending music/new releases, strictly excluding mixes and playlists
    const query = '"videoclip oficial" 2026 -"mix" -"playlist" -"enganchado" -"recopilacion" -"compilacion" -"álbum"';
    const songs = await fetchYouTubeSongs(query);

    // Additional post-fetch filtering to ensure no stray mixes slip through
    const pureSongs = songs.filter((song: any) => {
      const title = (song.title || '').toLowerCase();
      return !title.includes('mix') && 
             !title.includes('playlist') && 
             !title.includes('enganchado') &&
             !title.includes('album');
    });

    return NextResponse.json(pureSongs.slice(0, 10)); // Top 10 pure new releases
  } catch (error: any) {
    console.error('API ERROR /api/public/releases:', error.message);
    // Devuelve un array vacío en lugar de un error 500 para que el sitio no crashee
    return NextResponse.json([]); 
  }
}
