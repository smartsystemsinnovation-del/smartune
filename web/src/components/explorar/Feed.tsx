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
    <div className="space-y-8">
      {/* Post Composer — Figma glass-card style */}
      <CreatePost onPostCreated={handlePostCreated} avatarUrl={currentUserAvatar} />

      {/* Post Feed */}
      <div className="space-y-8">
        {posts.length > 0 ? (
          posts.map(post => (
            <PostCard key={post.id} post={post} currentUserId={currentUserId} />
          ))
        ) : (
          <div className="glass-card rounded-2xl p-8 text-center border border-white/5">
            <p className="text-lg font-medium text-white mb-2">Aún no hay publicaciones</p>
            <p className="text-sm text-gray-400">Sé el primero en compartir algo con la comunidad.</p>
          </div>
        )}
      </div>
    </div>
  );
}
