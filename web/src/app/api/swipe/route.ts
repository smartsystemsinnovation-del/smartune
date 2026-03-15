import { NextResponse } from 'next/server';

// Mock database in-memory (This will reset on server restart)
// In production, this should be saved to Supabase/PostgreSQL
let likedSongs: any[] = [];
let interactionCounts = {
  likes: 0,
  views: 0,
  discards: 0,
};

export async function GET() {
  return NextResponse.json(likedSongs);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { song, action } = body;

    interactionCounts.views += 1;

    if (action === 'like') {
      interactionCounts.likes += 1;
      // Avoid duplicates
      if (!likedSongs.find(s => s.id === song.id)) {
        likedSongs.push(song);
      }
    } else {
      interactionCounts.discards += 1;
    }

    return NextResponse.json({ 
      success: true, 
      counts: interactionCounts 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

// Additional helper for the counters
export async function PATCH() {
  return NextResponse.json(interactionCounts);
}
