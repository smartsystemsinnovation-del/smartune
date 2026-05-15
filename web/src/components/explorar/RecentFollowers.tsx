"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

const DEFAULT_AVATAR = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';

interface Suggestion {
  id: string;
  nombre: string;
  avatar_url: string;
}

export default function RecentFollowers() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set());
  const [loadingFollow, setLoadingFollow] = useState<string | null>(null);

  const fetchSuggestions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/social/followers');
      const json = await res.json();
      if (json.success && json.data) setSuggestions(json.data);
    } catch (e) {
      console.error('Error fetching suggestions', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSuggestions(); }, [fetchSuggestions]);

  const handleFollow = async (id: string) => {
    setLoadingFollow(id);
    const isFollowed = followedIds.has(id);
    try {
      await fetch('/api/social/followers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: id, action: isFollowed ? 'unfollow' : 'follow' }),
      });
      setFollowedIds(prev => {
        const next = new Set(prev);
        isFollowed ? next.delete(id) : next.add(id);
        return next;
      });
    } catch (e) {
      console.error('Follow error', e);
    } finally {
      setLoadingFollow(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col" style={{ gap: '10px' }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="w-9 h-9 rounded-full bg-white/5 flex-shrink-0" />
            <div className="flex-1">
              <div className="h-3 bg-white/5 rounded w-24 mb-1.5" />
              <div className="h-2.5 bg-white/5 rounded w-16" />
            </div>
            <div className="w-7 h-7 rounded-full bg-white/5" />
          </div>
        ))}
      </div>
    );
  }

  if (suggestions.length === 0) return (
    <p className="text-[12px] text-white/30 text-center py-2">No hay sugerencias por ahora</p>
  );

  return (
    <div className="flex flex-col" style={{ gap: '10px' }}>
      {suggestions.map(user => {
        const isFollowed = followedIds.has(user.id);
        const handle = '@' + user.nombre.toLowerCase().replace(/\s+/g, '');

        return (
          <div
            key={user.id}
            className="flex items-center gap-3 py-1.5 px-2 rounded-xl hover:bg-white/[0.03] transition-colors group"
          >
            {/* Avatar — clickable */}
            <Link href={`/profile/${user.id}`} className="flex-shrink-0">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-white/[0.08]">
                <img
                  src={user.avatar_url || DEFAULT_AVATAR}
                  alt={user.nombre}
                  className="w-full h-full object-cover"
                  onError={e => { (e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR; }}
                />
              </div>
            </Link>

            {/* Nombre y handle — clickable */}
            <Link href={`/profile/${user.id}`} className="flex-1 min-w-0 hover:opacity-80 transition-opacity">
              <p className="text-[13px] font-bold text-white leading-tight truncate">{user.nombre}</p>
              <p className="text-[11px] text-white/35 leading-tight truncate">{handle}</p>
            </Link>

            {/* Botón seguir */}
            <button
              onClick={() => handleFollow(user.id)}
              disabled={loadingFollow === user.id}
              className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                isFollowed
                  ? 'bg-gradient-to-r from-[#f6339a] to-[#9810fa]'
                  : 'bg-transparent border border-white/10 hover:border-white/30 text-white/50 hover:text-white'
              } ${loadingFollow === user.id ? 'opacity-50' : ''}`}
              title={isFollowed ? 'Dejar de seguir' : 'Seguir'}
            >
              {loadingFollow === user.id ? (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isFollowed ? (
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="white" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}