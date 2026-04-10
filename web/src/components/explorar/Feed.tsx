'use client';
import { useState } from 'react';
import CreatePost from './CreatePost';
import PostCard from './PostCard';

import { motion, Variants } from 'framer-motion';

export default function Feed({ initialPosts, currentUserId, currentUserAvatar }: { initialPosts: any[], currentUserId: string, currentUserAvatar?: string }) {
  const [posts, setPosts] = useState(initialPosts);

  const handlePostCreated = (newPost: any) => {
    setPosts([newPost, ...posts]);
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-bold text-white">Feeds</h1>
        <div className="flex items-center gap-5 text-[13px] font-medium">
          <button className="text-white">Recents</button>
          <button className="text-white/30 hover:text-white/60 transition-colors">Friends</button>
          <button className="text-white/30 hover:text-white/60 transition-colors">Popular</button>
        </div>
      </div>

      {/* Feed list */}
      <motion.div 
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {posts.length > 0 ? (
          posts.map(post => (
            <motion.div key={post.id} variants={itemVariants}>
              <PostCard post={post} currentUserId={currentUserId} />
            </motion.div>
          ))
        ) : (
          <div className="text-center py-16 bg-[#17102a] rounded-2xl border border-[#2e1e42]">
            <p className="text-[14px] text-white/40 mb-1">No posts yet</p>
            <p className="text-[12px] text-white/20">Be the first to share something</p>
          </div>
        )}
      </motion.div>

      {/* Create Post */}
      <CreatePost onPostCreated={handlePostCreated} avatarUrl={currentUserAvatar} />
    </div>
  );
}
