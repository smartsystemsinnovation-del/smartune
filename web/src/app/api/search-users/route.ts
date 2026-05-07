import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json({ users: [] });
    }

    const supabase = await createClient();

    // Buscar usuarios por nombre o correo (limitamos a 10 para no saturar)
    const { data: users, error } = await supabase
      .from('usuarios')
      .select('id, nombre, correo, avatar_url')
      .or(`nombre.ilike.%${query}%,correo.ilike.%${query}%`)
      .eq('rol', 'estudiante')
      .limit(10);

    if (error) {
      console.error("Error buscando usuarios:", error);
      return NextResponse.json({ error: 'Error al buscar usuarios' }, { status: 500 });
    }

    return NextResponse.json({ users });

  } catch (error: any) {
    console.error("Error general API Route search-users:", error);
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}
