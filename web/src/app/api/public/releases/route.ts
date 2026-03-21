import { NextResponse } from 'next/server';
import { fetchYouTubeSongs } from '@/utils/youtube';

export const revalidate = 3600; // Cache for 1 hour to deeply save API Quota

export async function GET() {
  try {
    // We search for trending music/new releases in general
    // or specify a popular generic query to catch latest hits
    const songs = await fetchYouTubeSongs('nuevos lanzamientos musica oficial hit 2026');
    return NextResponse.json(songs.slice(0, 10)); // Top 10 new releases
  } catch (error: any) {
    console.error('API ERROR /api/public/releases:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
