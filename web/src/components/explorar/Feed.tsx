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
    <div className="w-full flex flex-col pb-4">
      {/* Post Cards */}
      <div className="flex flex-col divide-y divide-[#2a2a35]/40">
        {posts.length > 0 ? (
          posts.map(post => (
            <PostCard key={post.id} post={post} currentUserId={currentUserId} />
          ))
        ) : (
          <div className="text-center text-gray-400 py-16 px-8">
            <p className="text-lg font-medium text-white mb-2">Aún no hay publicaciones</p>
            <p className="text-sm">Sé el primero en compartir algo con la comunidad.</p>
          </div>
        )}
      </div>

      {/* Composer at the bottom (Figma style) */}
      <div className="px-5 py-4 border-t border-[#2a2a35]/40">
        <CreatePost onPostCreated={handlePostCreated} avatarUrl={currentUserAvatar} />
      </div>
    </div>
  );
}
