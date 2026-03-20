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
    <div className="max-w-2xl mx-auto w-full flex flex-col gap-6 pb-20 mt-6 px-4">
      <CreatePost onPostCreated={handlePostCreated} avatarUrl={currentUserAvatar} />
      <div className="flex flex-col gap-6 w-full">
        {posts.length > 0 ? (
          posts.map(post => (
            <PostCard key={post.id} post={post} currentUserId={currentUserId} />
          ))
        ) : (
          <div className="text-center text-gray-400 mt-10 p-8 bg-[#1a1a24] rounded-2xl border border-[#2a2a35]">
            <p className="text-lg font-medium text-white mb-2">Aún no hay publicaciones</p>
            <p className="text-sm">Sé el primero en compartir algo con la comunidad.</p>
          </div>
        )}
      </div>
    </div>
  );
}
