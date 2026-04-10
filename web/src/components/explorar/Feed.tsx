'use client';
import { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import CreatePost from './CreatePost';
import PostCard from './PostCard';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};

export default function Feed({ initialPosts, currentUserId, currentUserAvatar }: { initialPosts: any[], currentUserId: string, currentUserAvatar?: string }) {
  const [posts, setPosts] = useState(initialPosts);

  const handlePostCreated = (newPost: any) => {
    setPosts([newPost, ...posts]);
  };

  return (
    <div className="space-y-6">
      <div className="px-4 sm:px-0">
        <CreatePost onPostCreated={handlePostCreated} avatarUrl={currentUserAvatar} />
      </div>
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
          <motion.div variants={itemVariants} className="text-center py-20">
            <svg className="w-14 h-14 text-gray-300 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
            </svg>
            <p className="text-[16px] font-bold text-gray-900 mb-2">Aún no hay publicaciones</p>
            <p className="text-[14px] text-gray-500 font-medium">Sé el primero en compartir algo con la comunidad</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
