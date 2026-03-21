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
    <div className="bg-[#1c1c24] rounded-2xl p-5 border border-white/5 shadow-xl">
      <h2 className="text-[12px] font-bold text-gray-400 tracking-widest uppercase mb-5">
        A quién seguir
      </h2>
      
      <div className="flex flex-col gap-4">
        {followers.map(user => {
          // Generate a fake handle based on name for the Figma look
          const handle = `@${user.nombre.toLowerCase().replace(/\s+/g, '_')}`;
          
          return (
            <div key={user.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-[#2a2a35] bg-[#121216]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={user.avatar_url || 'https://utfs.io/f/cd2bb812-a1f9-4675-9257-238b6c0fe1b8-c906oz.png'} alt={user.nombre} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-white leading-tight">{user.nombre}</span>
                  <span className="text-[11px] text-gray-500">{handle}</span>
                </div>
              </div>
              <button className="px-4 py-1.5 bg-white text-black text-[11px] font-bold rounded-full hover:bg-gray-200 transition-colors">
                Seguir
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
