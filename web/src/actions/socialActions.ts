'use server'

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getFeed() {
  try {
    const supabase = await createClient();
    const { data: userAuth } = await supabase.auth.getUser();
    
    if (!userAuth.user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Fetch posts with details
    const { data, error } = await supabase
      .from('vw_posts_with_details')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      return { success: false, error: error.message };
    }

    // Also fetch the user's current likes to know if the heart should be active
    const { data: userLikes, error: likesError } = await supabase
      .from('likes')
      .select('post_id')
      .eq('user_id', userAuth.user.id);

    if (likesError) {
      return { success: false, error: likesError.message };
    }

    const likedPostIds = new Set(userLikes.map(l => l.post_id));

    const posts = data.map(post => ({
      ...post,
      hasLiked: likedPostIds.has(post.id)
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
    const file = formData.get('image') as File | null;
    
    if (!content && !file) {
      return { success: false, error: 'Post cannot be empty' };
    }

    let image_url = null;

    if (file && file.size > 0) {
      const fileExt = file.name.split('.').pop();
      const filePath = `${userAuth.user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('posts_images')
        .upload(filePath, file);

      if (uploadError) {
        return { success: false, error: uploadError.message };
      }

      const { data: publicUrlData } = supabase.storage
        .from('posts_images')
        .getPublicUrl(filePath);
        
      image_url = publicUrlData.publicUrl;
    }

    const { data: newPost, error } = await supabase
      .from('posts')
      .insert({
        user_id: userAuth.user.id,
        content: content || '',
        image_url
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/explorar');
    return { success: true, data: newPost };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleLike(postId: string, hasLiked: boolean) {
  try {
    const supabase = await createClient();
    const { data: userAuth } = await supabase.auth.getUser();
    
    if (!userAuth.user) {
      return { success: false, error: 'Unauthorized' };
    }

    if (hasLiked) {
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
        created_at,
        usuarios ( nombre, avatar_url )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addComment(postId: string, content: string) {
  try {
    const supabase = await createClient();
    const { data: userAuth } = await supabase.auth.getUser();
    
    if (!userAuth.user) {
      return { success: false, error: 'Unauthorized' };
    }

    if (!content.trim()) {
      return { success: false, error: 'Comment cannot be empty' };
    }

    const { error } = await supabase
      .from('post_comments')
      .insert({
        post_id: postId,
        user_id: userAuth.user.id,
        content
      });

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
