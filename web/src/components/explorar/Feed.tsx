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
    <div className="space-y-6 lg:space-y-8 w-full">
      {/* Feeds Header from mockup */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-[28px] lg:text-[32px] font-extrabold text-white tracking-tight">Feeds</h1>
        <div className="flex items-center gap-4 lg:gap-6 text-[14px] font-bold">
          <button className="text-white transition-opacity">Recents</button>
          <button className="text-white/40 hover:text-white/80 transition-colors">Friends</button>
          <button className="text-white/40 hover:text-white/80 transition-colors">Popular</button>
        </div>
      </div>

      {/* Main feed list */}
      <div className="space-y-5 lg:space-y-8">
        {posts.length > 0 ? (
          posts.map(post => (
            <PostCard key={post.id} post={post} currentUserId={currentUserId} />
          ))
        ) : (
          <div className="text-center py-20 bg-[#1a1a22] rounded-3xl border border-white/[0.04]">
                        <svg className="w-14 h-14 text-white/10 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
            </svg>
            <p className="text-[15px] font-bold text-white/70 mb-1">Aún no hay publicaciones</p>
            <p className="text-[13px] text-white/25">Sé el primero en compartir algo con la comunidad</p>
          </div>
        )}
      </div>

      {/* Create Post at the bottom to match mockup architecture */}
      <div className="pt-2 pb-6">
        <CreatePost onPostCreated={handlePostCreated} avatarUrl={currentUserAvatar} />
      </div>
    </div>
  );
}
