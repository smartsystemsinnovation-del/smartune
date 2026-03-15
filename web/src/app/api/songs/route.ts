import { NextResponse } from 'next/server';
import { fetchYouTubeSongs } from '@/utils/youtube';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const genre = searchParams.get('genre') || undefined;
    const songs = await fetchYouTubeSongs(genre);
    return NextResponse.json(songs);
  } catch (error: any) {
    console.error('CRITICAL API ERROR /api/songs:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
