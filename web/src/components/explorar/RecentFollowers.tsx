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
    <div className="space-y-6">
      {followers.map(user => {
        const isFollowed = followedIds.has(user.id);
        const avatarSrc = user.avatar_url || `${DEFAULT_AVATAR}${encodeURIComponent(user.nombre)}`;
        return (
          <div key={user.id} className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-full overflow-hidden bg-[#2e1e42]/50 border border-[#00ffff]/20 shadow-[0_0_10px_rgba(0,255,255,0.1)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={avatarSrc} alt={user.nombre} className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <p className="text-[14px] font-bold text-white leading-tight mb-0.5">{user.nombre}</p>
                <p className="text-[12px] text-white/40">Suggested for you</p>
              </div>
            </div>
            <button
              onClick={() => handleFollow(user.id)}
              className={`text-[12px] font-bold px-4 py-1.5 rounded-full transition-all duration-300 active:scale-95 ${
                isFollowed
                  ? 'bg-white/[0.04] text-white/40 hover:bg-white/10'
                  : 'bg-white/[0.04] border border-[#ea88ff]/40 text-[#ea88ff] hover:bg-[#ea88ff] hover:text-black hover:shadow-[0_0_15px_rgba(234,136,255,0.4)]'
              }`}
            >
              {isFollowed ? 'Following' : 'Follow'}
            </button>
          </div>
        );
      })}
      <button className="text-[13px] font-bold text-white/40 hover:text-white transition-colors mt-2">
        See all
      </button>
    </div>
  );
}
