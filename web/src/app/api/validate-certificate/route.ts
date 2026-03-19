import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini AI SDK
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    const { documentBase64, mimeType } = await request.json();

    if (!documentBase64 || !mimeType) {
      return NextResponse.json({ error: 'Missing documentBase64 or mimeType' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not defined');
      return NextResponse.json({ error: 'Server Configuration Error' }, { status: 500 });
    }

    // Usar Gemini 1.5 Flash para un procesamiento más rápido
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Actúa como un validador de documentos oficiales. Analiza esta imagen de un certificado. Busca nombres, instituciones (ej. Conservatorio, Universidad), fechas y evalúa la coherencia gráfica (presencia de sellos, firmas, ausencia de manipulación obvia). Devuelve ÚNICAMENTE un objeto JSON válido con este formato: { "confidenceScore": [número del 1 al 100], "reason": "[breve explicación]" }.`;

    const imageParts = [
      {
        inlineData: {
          data: documentBase64,
          mimeType: mimeType
        }
      }
    ];

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    let text = response.text();

    console.log("Raw Gemini Response:", text);

    // Limpiar la respuesta si Gemini devuelve markdown o texto extra
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
      const parsedJson = JSON.parse(text);
      if (typeof parsedJson.confidenceScore !== 'number' || typeof parsedJson.reason !== 'string') {
        throw new Error('Formato de respuesta JSON de Gemini incompleto');
      }
      return NextResponse.json(parsedJson);
    } catch (parseError) {
      console.error('Error parsing Gemini JSON:', text, parseError);
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }
    
  } catch (error: any) {
    console.error('Error in AI validation:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
