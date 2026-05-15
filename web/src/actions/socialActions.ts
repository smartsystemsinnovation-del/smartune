'use server'

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getFeed(tab: 'Recientes' | 'Amigos' | 'Populares' = 'Recientes') {
  try {
    const supabase = await createClient();
    const { data: userAuth } = await supabase.auth.getUser();
    
    if (!userAuth.user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Base query setup
    let query = supabase.from('vw_posts_with_details').select('*');

    // 1. Determine sort order
    if (tab === 'Populares') {
      query = query.order('likes_count', { ascending: false }).order('created_at', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    // 2. Filter for "Amigos" (mutual followers)
    if (tab === 'Amigos') {
      // Find people I follow
      const { data: followings } = await supabase
        .from('seguidores')
        .select('seguido_id')
        .eq('seguidor_id', userAuth.user.id);
      
      // Find people that follow me
      const { data: followers } = await supabase
        .from('seguidores')
        .select('seguidor_id')
        .eq('seguido_id', userAuth.user.id);

      const followedIds = new Set(followings?.map(f => f.seguido_id) || []);
      const mutualFriends = (followers?.map(f => f.seguidor_id) || []).filter(id => followedIds.has(id));

      if (mutualFriends.length === 0) {
        // No friends means feed is empty immediately
        return { success: true, data: [], userId: userAuth.user.id };
      }
      
      query = query.in('user_id', mutualFriends);
    }

    // Execute Main Query
    const { data, error } = await query.limit(50);

    if (error) {
      return { success: false, error: error.message };
    }

    // Fetch the user's current likes to know if the heart should be active
    const { data: userLikes, error: likesError } = await supabase
      .from('likes')
      .select('post_id')
      .eq('user_id', userAuth.user.id);

    if (likesError) {
      return { success: false, error: likesError.message };
    }

    // Fetch whom the current user follows to initialize the "Follow" button
    const { data: followingData } = await supabase
      .from('seguidores')
      .select('seguido_id')
      .eq('seguidor_id', userAuth.user.id);

    const likedPostIds = new Set(userLikes.map(l => l.post_id));
    const followedUserIds = new Set(followingData?.map(f => f.seguido_id) || []);

    // Ensure we have roles even if view is not updated in DB yet
    const authorIds = Array.from(new Set(data.map(p => p.user_id)));
    const { data: authorsMetadata } = await supabase
      .from('usuarios')
      .select('id, rol')
      .in('id', authorIds);
    
    const roleMapping = new Map(authorsMetadata?.map(u => [u.id, u.rol]) || []);

    const posts = data.map(post => ({
      ...post,
      hasLiked: likedPostIds.has(post.id),
      isFollowing: followedUserIds.has(post.user_id),
      rol: post.rol || roleMapping.get(post.user_id)
    }));

    return { success: true, data: posts, userId: userAuth.user.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createPost(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: userAuth } = await supabase.auth.getUser();
    
    if (!userAuth.user) {
      return { success: false, error: 'Unauthorized' };
    }

    const content = formData.get('content') as string;
    // Files are uploaded client-side; we receive public URLs directly
    const imageUrl = (formData.get('image_url') as string) || null;
    const audioUrl = (formData.get('audio_url') as string) || null;

    const { error } = await supabase
      .from('posts')
      .insert({
        user_id: userAuth.user.id,
        content,
        image_url: imageUrl,
        audio_url: audioUrl
      });

    if (error) throw error;
    
    revalidatePath('/explorar');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleLike(postId: string, alreadyLiked: boolean) {
  try {
    const supabase = await createClient();
    const { data: userAuth } = await supabase.auth.getUser();
    if (!userAuth.user) return { success: false, error: 'Unauthorized' };

    if (alreadyLiked) {
      // Remove like
      const { error } = await supabase
        .from('likes')
        .delete()
        .match({ post_id: postId, user_id: userAuth.user.id });
        
      if (error) return { success: false, error: error.message };
    } else {
      // Add like
      const { error } = await supabase
        .from('likes')
        .insert({ post_id: postId, user_id: userAuth.user.id });
        
      if (error) return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getComments(postId: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('post_comments')
      .select(`
        id,
        content,
        image_url,
        audio_url,
        created_at,
        usuarios ( nombre, avatar_url, rol )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addComment(postId: string, content: string, imageUrl?: string | null, audioUrl?: string | null) {
  try {
    const supabase = await createClient();
    const { data: userAuth } = await supabase.auth.getUser();
    if (!userAuth.user) return { success: false, error: 'Unauthorized' };

    const { error } = await supabase
      .from('post_comments')
      .insert({
        post_id: postId,
        user_id: userAuth.user.id,
        content,
        image_url: imageUrl || null,
        audio_url: audioUrl || null
      });

    if (error) return { success: false, error: error.message };
    revalidatePath('/explorar');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleFollow(followedId: string, currentlyFollowing: boolean) {
  try {
    const supabase = await createClient();
    const { data: userAuth } = await supabase.auth.getUser();
    if (!userAuth.user) return { success: false, error: 'Unauthorized' };

    if (currentlyFollowing) {
      const { error } = await supabase
        .from('seguidores')
        .delete()
        .match({ seguidor_id: userAuth.user.id, seguido_id: followedId });
      if (error) return { success: false, error: error.message };
    } else {
      const { error } = await supabase
        .from('seguidores')
        .insert({ seguidor_id: userAuth.user.id, seguido_id: followedId });
      if (error) return { success: false, error: error.message };
    }

    revalidatePath('/explorar');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deletePost(postId: string) {
  try {
    const supabase = await createClient();
    const { data: userAuth } = await supabase.auth.getUser();
    if (!userAuth.user) return { success: false, error: 'Unauthorized' };

    const { error } = await supabase
      .from('posts')
      .delete()
      .match({ id: postId, user_id: userAuth.user.id });

    if (error) return { success: false, error: error.message };

    revalidatePath('/explorar');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

