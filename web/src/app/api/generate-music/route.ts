import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(request: Request) {
  try {
    const { prompt, mode = 'generate' } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Call Gemini API 
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    let systemPrompt = "";
    if (mode === 'chat') {
      systemPrompt = `Actúa como un productor musical experto y asistente creativo. Responde a preguntas sobre teoría musical, consejos de producción, historia de la música o ayuda técnica de forma breve y profesional en español. Mantén un tono inspirador y "cool".`;
    } else {
      systemPrompt = `Actúa como un experto productor musical de IA capaz de crear cualquier género (Pop, Rock, K-pop, Jazz, Trap, etc.). El usuario quiere generar: "${prompt}". 
      Genera un objeto JSON con:
      - title: Título creativo.
      - artist: Nombre de artista de IA.
      - mood: Sentimiento de la canción.
      - bpm: Número estimado de BPM.
      Solo devuelve el JSON, nada más.`;
    }

    const geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `${systemPrompt}\n\nConsulta del usuario: ${prompt}` }]
        }],
        generationConfig: {
            response_mime_type: mode === 'generate' ? "application/json" : "text/plain",
        }
      })
    });

    let aiMetadata: any;

    if (!geminiResponse.ok) {
      const errorBody = await geminiResponse.text();
      console.error(`Gemini API Error Detail (${geminiResponse.status}):`, errorBody);
      
      if (geminiResponse.status === 403 || geminiResponse.status === 401) {
        if (mode === 'chat') {
          return NextResponse.json({ text: "Lo siento, el servicio de asistente inteligente no está disponible en este momento. Habilita la API Key para chatear." });
        }
        aiMetadata = {
          title: `${prompt.substring(0, 15)} (AI Mix)`,
          artist: "SmarTune IA",
          mood: "Vibrant & Experimental",
          bpm: 124,
          isFallback: true
        };
      } else {
        // Here we return the full error body for debugging (400 cases)
        return NextResponse.json({ 
          error: `Gemini API Error: ${geminiResponse.status}`,
          details: errorBody 
        }, { status: geminiResponse.status });
      }
    } else {
      const geminiData = await geminiResponse.json();
      
      if (mode === 'chat') {
        return NextResponse.json({ text: geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "No obtuve respuesta del asistente." });
      }

      try {
        const content = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
        aiMetadata = JSON.parse(content);
      } catch (e: any) {
        aiMetadata = {
          title: `Smart AI Track: ${prompt.substring(0, 10)}`,
          artist: "SmarTune Pro",
          mood: "Creative",
          bpm: 128
        };
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const result = {
      id: `ai-${Date.now()}`,
      title: aiMetadata.title,
      artist: aiMetadata.artist,
      mood: aiMetadata.mood,
      bpm: aiMetadata.bpm,
      isFallback: aiMetadata.isFallback || false,
      coverUrl: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000&auto=format&fit=crop",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", 
    };

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to process request with Gemini' }, { status: 500 });
  }
}
