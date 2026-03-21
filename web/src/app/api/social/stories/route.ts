import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Get the list of user IDs this user follows
    const { data: follows } = await supabase
      .from('seguidores')
      .select('seguido_id')
      .eq('seguidor_id', user.id);

    // Build the list: followed users + self (so you can see your own story)
    const followedIds = (follows || []).map(f => f.seguido_id);
    const allIds = [...new Set([user.id, ...followedIds])];

    // 2. Fetch active stories (not expired) only from followed users + self
    const { data: stories, error } = await supabase
      .from('historias')
      .select('id, media_url, created_at, expires_at, usuario_id, usuarios(id, nombre, avatar_url)')
      .in('usuario_id', allIds)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching stories:', error);
      return NextResponse.json({ success: true, data: [] });
    }

    // 3. Group stories by user (each user shows as one circle, latest story first)
    const userStoriesMap = new Map<string, any>();
    for (const story of (stories || [])) {
      const uid = story.usuario_id;
      if (!userStoriesMap.has(uid)) {
        userStoriesMap.set(uid, {
          userId: uid,
          nombre: (story.usuarios as any)?.nombre || 'Usuario',
          avatar_url: (story.usuarios as any)?.avatar_url || '',
          stories: [],
          isOwn: uid === user.id,
        });
      }
      userStoriesMap.get(uid).stories.push({
        id: story.id,
        media_url: story.media_url,
        created_at: story.created_at,
        expires_at: story.expires_at,
      });
    }

    // Convert to array, put own story first
    const grouped = Array.from(userStoriesMap.values());
    grouped.sort((a, b) => {
      if (a.isOwn) return -1;
      if (b.isOwn) return 1;
      return 0;
    });

    return NextResponse.json({ success: true, data: grouped });
  } catch (error: any) {
    console.error('Stories GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Accept multipart form data with the actual file
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('historias')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      // If bucket doesn't exist, try to create it and retry
      if (uploadError.message?.includes('not found') || uploadError.message?.includes('Bucket')) {
        // Try creating the bucket
        await supabase.storage.createBucket('historias', { public: true, fileSizeLimit: 10485760 });
        const { error: retryError } = await supabase.storage
          .from('historias')
          .upload(fileName, file, { contentType: file.type, upsert: false });
        if (retryError) throw retryError;
      } else {
        throw uploadError;
      }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('historias')
      .getPublicUrl(fileName);

    const publicUrl = urlData.publicUrl;

    // Insert into historias table
    const { error: insertError } = await supabase
      .from('historias')
      .insert({
        usuario_id: user.id,
        media_url: publicUrl,
      });

    if (insertError) throw insertError;

    return NextResponse.json({ success: true, media_url: publicUrl });
  } catch (error: any) {
    console.error('Stories POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
