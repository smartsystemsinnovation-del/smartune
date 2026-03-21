"use client";

import React, { useState, useEffect } from 'react';

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?background=f6339a&color=fff&bold=true&size=128&name=';

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
    <section className="glass-card rounded-2xl p-5 border border-white/[0.06] shadow-lg">
      <h2 className="text-[11px] font-bold tracking-[0.15em] text-gray-500 uppercase mb-5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        Personas que quizá conozcas
      </h2>
      <div className="space-y-4">
        {followers.map(user => {
          const handle = `@${user.nombre.toLowerCase().replace(/\s+/g, '_')}`;
          const avatarSrc = user.avatar_url || `${DEFAULT_AVATAR}${encodeURIComponent(user.nombre)}`;
          return (
            <div key={user.id} className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full overflow-hidden bg-[#2a2a35] ring-2 ring-white/[0.06]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={avatarSrc} alt={user.nombre} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-white leading-tight">{user.nombre}</p>
                  <p className="text-[10px] text-gray-500">{handle}</p>
                </div>
              </div>
              <button className="px-4 py-1.5 bg-white/90 text-black text-[10px] font-bold rounded-full hover:bg-[#f6339a] hover:text-white transition-all hover:shadow-[0_0_12px_rgba(246,51,154,0.3)] active:scale-95">
                Seguir
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
