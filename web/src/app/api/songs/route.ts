import { NextResponse } from 'next/server';
import { fetchSpotifySongs } from '@/utils/spotify';

export async function GET() {
  try {
    const songs = await fetchSpotifySongs();
    return NextResponse.json(songs);
  } catch (error: any) {
    console.error('Error fetching songs:', error);
    return NextResponse.json({ error: 'Failed to fetch songs' }, { status: 500 });
  }
}
