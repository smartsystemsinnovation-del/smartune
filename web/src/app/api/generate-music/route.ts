import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    const { prompt, mode = 'generate' } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'El prompt es obligatorio' }, { status: 400 });
    }

    // Actualizamos al modelo de última generación (Abril 2026)
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash", 
    });

    const systemInstruction = mode === 'chat' 
      ? "Actúa como un productor musical experto y asistente creativo de SmarTune. Responde a preguntas sobre teoría musical, consejos de producción, historia de la música o ayuda técnica de forma breve y profesional en español. Mantén un tono inspirador y moderno."
      : "Actúa como un compositor musical de IA de SmarTune. Genera metadatos creativos para una canción (título, artista, mood, bpm) basada en la descripción del usuario. Debes responder estrictamente en formato JSON.";

    const result = await model.generateContent(`${systemInstruction}\n\nUsuario: ${prompt}`);
    const response = await result.response;
    const text = response.text();

    if (mode === 'chat') {
      return NextResponse.json({ text });
    }

    try {
      const cleanJson = text.replace(/```json|```/g, '').trim();
      const aiMetadata = JSON.parse(cleanJson);
      
      return NextResponse.json({
        id: `ai-${Date.now()}`,
        title: aiMetadata.title || "Untitled AI Track",
        artist: aiMetadata.artist || "SmarTune AI",
        mood: aiMetadata.mood || "Modern Vibez",
        bpm: aiMetadata.bpm || 120,
        coverUrl: `https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000&auto=format&fit=crop&sig=${Date.now()}`,
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        isFallback: false
      });
    } catch (parseError) {
      return NextResponse.json({
        id: `ai-fallback-${Date.now()}`,
        title: `${prompt.substring(0, 15)}...`,
        artist: "SmarTune AI",
        mood: "Atmospheric",
        bpm: 124,
        coverUrl: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000&auto=format&fit=crop",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        isFallback: true
      });
    }

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ 
      error: 'Error de conexión con Gemini 2.5', 
      details: error.message 
    }, { status: 500 });
  }
}

