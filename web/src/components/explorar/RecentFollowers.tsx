"use client";

import React, { useState, useEffect } from 'react';

interface Follower {
  id: string;
  nombre: string;
  avatar_url: string;
}

export default function RecentFollowers() {
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFollowers() {
      try {
        const res = await fetch('/api/social/followers');
        const json = await res.json();
        if (json.success && json.data) {
          setFollowers(json.data);
        }
      } catch (e) {
        console.error('Error fetching followers', e);
      } finally {
        setLoading(false);
      }
    }
    fetchFollowers();
  }, []);

  if (loading || followers.length === 0) return null;

  return (
    <section className="glass-card rounded-2xl p-6 border border-white/5">
      <h2 className="text-sm font-bold tracking-widest text-gray-400 uppercase mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        Who to follow
      </h2>
      <div className="space-y-4">
        {followers.map(user => {
          const handle = `@${user.nombre.toLowerCase().replace(/\s+/g, '_')}`;
          return (
            <div key={user.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full overflow-hidden bg-[#1f1f1f]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={user.avatar_url || 'https://utfs.io/f/cd2bb812-a1f9-4675-9257-238b6c0fe1b8-c906oz.png'} alt={user.nombre} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{user.nombre}</p>
                  <p className="text-[10px] text-gray-500/60">{handle}</p>
                </div>
              </div>
              <button className="px-4 py-1.5 bg-white text-black text-[10px] font-bold rounded-full hover:bg-[#f6339a] hover:text-white transition-colors">
                Follow
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
