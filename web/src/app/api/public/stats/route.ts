import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const revalidate = 600; // Cache for 10 minutes

export async function GET() {
  try {
    const supabase = await createClient();

    // To aggregate safely without exposing personal data via RPC or raw query,
    // we fetch only rol and instrumento fields which are safe to count.
    const { data: users, error } = await supabase
      .from('perfiles_publicos')
      .select('rol, instrumento');

    if (error) {
      console.error('API Error Fetching Stats:', error);
      return NextResponse.json({ error: 'Ocurrió un error general en el servidor.' }, { status: 500 });
    }

    const studentsMap: Record<string, number> = {};
    const teachersMap: Record<string, number> = {};

    users?.forEach(u => {
      const inst = u.instrumento?.trim();
      if (!inst) return;
      
      const titleInst = inst.charAt(0).toUpperCase() + inst.slice(1).toLowerCase();

      if (u.rol === 'estudiante') {
        studentsMap[titleInst] = (studentsMap[titleInst] || 0) + 1;
      } else if (u.rol === 'profesor') {
        teachersMap[titleInst] = (teachersMap[titleInst] || 0) + 1;
      }
    });

    const formatMap = (map: Record<string, number>) => {
      return Object.entries(map)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    };

    return NextResponse.json({
      topInstrumentos: formatMap(studentsMap),
      topEnsenanzas: formatMap(teachersMap)
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
