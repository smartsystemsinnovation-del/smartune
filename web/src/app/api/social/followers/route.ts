import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get IDs of users I already follow
    const { data: follows } = await supabase
      .from('seguidores')
      .select('seguido_id')
      .eq('seguidor_id', user.id);

    const followedIds = (follows || []).map(f => f.seguido_id);
    const excludeIds = [user.id, ...followedIds];

    // Fetch all users not already followed, then randomize in JS
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nombre, avatar_url')
      .not('id', 'in', `(${excludeIds.join(',')})`)
      .limit(20); // fetch more, then pick random subset

    if (error || !data || data.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Fisher-Yates shuffle and pick 5
    const shuffled = [...data];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const suggestions = shuffled.slice(0, 5);

    return NextResponse.json({ success: true, data: suggestions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { targetUserId, action } = await request.json();
    if (!targetUserId) return NextResponse.json({ error: 'Missing targetUserId' }, { status: 400 });

    if (action === 'unfollow') {
      await supabase
        .from('seguidores')
        .delete()
        .eq('seguidor_id', user.id)
        .eq('seguido_id', targetUserId);
    } else {
      await supabase
        .from('seguidores')
        .upsert({ seguidor_id: user.id, seguido_id: targetUserId }, { onConflict: 'seguidor_id,seguido_id' });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
