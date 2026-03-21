"use client";

import React, { useState, useEffect } from 'react';

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?background=2a2a35&color=fff&bold=true&size=128&name=';

interface Follower {
  id: string;
  nombre: string;
  avatar_url: string;
}

export default function RecentFollowers() {
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [loading, setLoading] = useState(true);
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchFollowers() {
      try {
        const res = await fetch('/api/social/followers');
        const json = await res.json();
        if (json.success && json.data) setFollowers(json.data);
      } catch (e) {
        console.error('Error fetching followers', e);
      } finally {
        setLoading(false);
      }
    }
    fetchFollowers();
  }, []);

  const handleFollow = (id: string) => {
    setFollowedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (loading || followers.length === 0) return null;

  return (
    <section className="bg-[#1a1a22] rounded-2xl p-5 border border-white/[0.04]">
      <h2 className="text-[11px] font-bold tracking-[0.15em] text-white/30 uppercase mb-5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        Personas sugeridas
      </h2>
      <div className="space-y-4">
        {followers.map(user => {
          const isFollowed = followedIds.has(user.id);
          const avatarSrc = user.avatar_url || `${DEFAULT_AVATAR}${encodeURIComponent(user.nombre)}`;
          return (
            <div key={user.id} className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full overflow-hidden bg-[#2a2a35]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={avatarSrc} alt={user.nombre} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-white leading-tight">{user.nombre}</p>
                  <p className="text-[11px] text-white/25">Sugerido para ti</p>
                </div>
              </div>
              <button
                onClick={() => handleFollow(user.id)}
                className={`text-[12px] font-bold px-4 py-1.5 rounded-lg transition-all duration-200 active:scale-95 ${
                  isFollowed
                    ? 'bg-white/[0.06] text-white/50 hover:text-white'
                    : 'text-[#0e9eef] hover:text-white'
                }`}
              >
                {isFollowed ? 'Siguiendo' : 'Seguir'}
              </button>
            </div>
          );
        })}
      </div>
      <button className="w-full text-center text-[12px] font-bold text-white/20 hover:text-white/50 transition-colors mt-5 pt-4 border-t border-white/[0.04]">
        Ver más sugerencias
      </button>
    </section>
  );
}
