"use client";

import React, { useState, useEffect } from 'react';

interface Tag {
  category?: string;
  name: string;
  posts: string | number;
}

export default function TrendingHashtags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTags() {
      try {
        const res = await fetch('/api/social/trending');
        const json = await res.json();
        if (json.success && json.data) {
          setTags(json.data);
        }
      } catch (e) {
        console.error('Error fetching trends', e);
      } finally {
        setLoading(false);
      }
    }
    fetchTags();
  }, []);

  if (loading || tags.length === 0) {
    return null; // Don't show anything if no trending hashtags (user requirement)
  }

  return (
    <div className="bg-[#1c1c24] rounded-2xl p-5 border border-white/5 shadow-xl">
      <h2 className="text-[12px] font-bold text-gray-400 tracking-widest uppercase mb-5">
        Trending Now
      </h2>
      
      <div className="flex flex-col gap-5">
        {tags.map((tag, idx) => (
          <div key={idx} className="flex flex-col group cursor-pointer">
            <span className="text-[11px] text-gray-500 font-medium tracking-wide group-hover:text-gray-400 transition-colors">
              {tag.category || 'Categoría • Trending'}
            </span>
            <span className="text-[14px] font-bold text-white mt-0.5 group-hover:text-[#f6339a] transition-colors">
              #{tag.name}
            </span>
            <span className="text-[11px] text-gray-500 font-medium">
              {tag.posts} posts
            </span>
          </div>
        ))}
      </div>
      
      <button className="mt-5 text-[12px] font-bold text-[#f6339a] hover:underline">
        Show more
      </button>
    </div>
  );
}
