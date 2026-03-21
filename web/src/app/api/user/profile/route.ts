import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { nombre, avatar_url, instrumento, gustos_musicales } = body;
    
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
