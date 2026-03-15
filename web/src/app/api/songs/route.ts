import { NextResponse } from 'next/server';
import { fetchSpotifySongs } from '@/utils/spotify';

export async function GET() {
  try {
    const songs = await fetchSpotifySongs();
    if (!songs || songs.length === 0) {
      console.warn('Spotify fetch returned 0 songs with previews');
    }
    return NextResponse.json(songs);
  } catch (error: any) {
    console.error('CRITICAL API ERROR /api/songs:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
