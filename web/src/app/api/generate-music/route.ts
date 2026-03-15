import { NextResponse } from 'next/server';

const GEMINI_API_KEY = "AIzaSyAZdUt8OvDUkVzF5G_Q4oF6E8CkFe6-6K4";

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Call Gemini API to process the prompt and create creative metadata
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Actúa como un experto productor musical de IA. El usuario ha dado este prompt: "${prompt}". 
            Genera un objeto JSON con los siguientes campos:
            - title: Un título creativo para la canción.
            - artist: Un nombre de artista/proyecto de IA pegajoso.
            - mood: Una descripción breve del sentimiento de la canción.
            - bpm: Un número estimado de BPM.
            Solo devuelve el JSON, nada de texto extra.`
          }]
        }],
        generationConfig: {
            response_mime_type: "application/json",
        }
      })
    });

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API Error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    let aiMetadata;
    
    try {
      const content = geminiData.candidates[0].content.parts[0].text;
      aiMetadata = JSON.parse(content);
    } catch (e) {
      aiMetadata = {
        title: `IA Track: ${prompt.substring(0, 15)}...`,
        artist: "SmarTune AI",
        mood: "Atmospheric",
        bpm: 120
      };
    }

    // Simulate AI generation delay (visual only)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Combine Gemini metadata with demo audio
    const result = {
      id: `ai-${Date.now()}`,
      title: aiMetadata.title,
      artist: aiMetadata.artist,
      mood: aiMetadata.mood,
      bpm: aiMetadata.bpm,
      coverUrl: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000&auto=format&fit=crop",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", // Demo audio
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('IA Generation Error:', error);
    return NextResponse.json({ error: 'Failed to generate music with Gemini' }, { status: 500 });
  }
}
