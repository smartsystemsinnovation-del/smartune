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

  if (loading || tags.length === 0) return null;

  return (
    <section className="glass-card rounded-2xl p-6 border border-white/5">
      <h2 className="text-sm font-bold tracking-widest text-gray-400 uppercase mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        Trending Now
      </h2>
      <div className="space-y-4">
        {tags.map((tag, idx) => (
          <div key={idx} className="cursor-pointer group">
            <p className="text-xs text-gray-500/60">{tag.category || 'Music • Trending'}</p>
            <p className="text-sm font-bold text-white group-hover:text-[#f6339a] transition-colors">
              {tag.name.startsWith('#') ? tag.name : `#${tag.name}`}
            </p>
            <p className="text-xs text-gray-500/60">{tag.posts} posts</p>
          </div>
        ))}
      </div>
      <button className="mt-6 text-xs font-bold text-[#f6339a] hover:underline">Show more</button>
    </section>
  );
}
