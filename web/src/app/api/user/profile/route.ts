import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { userProfileUpdateSchema } from '@/domain/validators/userSchemas';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('usuarios')
      .select('nombre, avatar_url, instrumento, gustos_musicales, rol')
      .eq('id', user.id)
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('API ERROR /api/user/profile GET:', error.message);
    return NextResponse.json({ error: 'Ocurrió un error general en el servidor.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const rawBody = await request.json();
    const parsed = userProfileUpdateSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Input inválido', details: parsed.error.issues }, { status: 400 });
    }

    const { nombre, avatar_url, instrumento, gustos_musicales } = parsed.data;
    
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
      .from('usuarios')
      .update({
        nombre,
        avatar_url,
        instrumento,
        gustos_musicales
      })
      .eq('id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API ERROR /api/user/profile PUT:', error.message);
    return NextResponse.json({ error: 'Ocurrió un error general en el servidor.' }, { status: 500 });
  }
}
