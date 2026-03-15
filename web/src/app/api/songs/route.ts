import { NextResponse } from 'next/server';
import { fetchYouTubeSongs } from '@/utils/youtube';

export async function GET() {
  try {
    const songs = await fetchYouTubeSongs();
    return NextResponse.json(songs);
  } catch (error: any) {
    console.error('CRITICAL API ERROR /api/songs:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
