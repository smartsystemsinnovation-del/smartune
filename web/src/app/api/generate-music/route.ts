import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Simulate AI generation delay (3-5 seconds)
    const delay = Math.floor(Math.random() * 2000) + 3000;
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Simulated result
    const result = {
      id: `ai-${Date.now()}`,
      title: `IA Masterpiece: ${prompt.substring(0, 20)}...`,
      artist: "SmarTune AI",
      coverUrl: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000&auto=format&fit=crop",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", // Demo audio
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('IA Generation Error:', error);
    return NextResponse.json({ error: 'Failed to generate music' }, { status: 500 });
  }
}
