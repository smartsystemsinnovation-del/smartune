'use client';
import { useState } from 'react';
import CreatePost from './CreatePost';
import PostCard from './PostCard';

export default function Feed({ initialPosts, currentUserId, currentUserAvatar }: { initialPosts: any[], currentUserId: string, currentUserAvatar?: string }) {
  const [posts, setPosts] = useState(initialPosts);

  const handlePostCreated = (newPost: any) => {
    setPosts([newPost, ...posts]);
  };

  return (
    <div className="space-y-6">
      {/* Post Composer */}
      <CreatePost onPostCreated={handlePostCreated} avatarUrl={currentUserAvatar} />

      {/* Feed */}
      <div className="space-y-5">
        {posts.length > 0 ? (
          posts.map(post => (
            <PostCard key={post.id} post={post} currentUserId={currentUserId} />
          ))
        ) : (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-5xl text-white/10 mb-4 block">photo_camera</span>
            <p className="text-[15px] font-bold text-white/80 mb-1">Aún no hay publicaciones</p>
            <p className="text-[13px] text-white/30">Sé el primero en compartir algo con la comunidad</p>
          </div>
        )}
      </div>
    </div>
  );
}
