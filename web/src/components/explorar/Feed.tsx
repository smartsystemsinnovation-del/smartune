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
      <CreatePost onPostCreated={handlePostCreated} avatarUrl={currentUserAvatar} />
      <div className="space-y-5">
        {posts.length > 0 ? (
          posts.map(post => (
            <PostCard key={post.id} post={post} currentUserId={currentUserId} />
          ))
        ) : (
          <div className="text-center py-20">
            <svg className="w-14 h-14 text-white/10 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
            </svg>
            <p className="text-[15px] font-bold text-white/70 mb-1">Aún no hay publicaciones</p>
            <p className="text-[13px] text-white/25">Sé el primero en compartir algo con la comunidad</p>
          </div>
        )}
      </div>
    </div>
  );
}
