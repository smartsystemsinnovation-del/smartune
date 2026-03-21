import React from 'react';

interface TrendingHashtagsProps {
  tags?: { name: string; posts: number }[];
}

export default function TrendingHashtags({ tags = [] }: TrendingHashtagsProps) {
  // Requirement: "si no hay hastang en tendencias pues no pongas nada"
  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <div className="w-full px-4 mb-6">
      <h2 className="text-[14px] font-bold text-white tracking-wide mb-3 flex items-center gap-2">
        <svg className="w-4 h-4 text-[#f6339a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Tendencias
      </h2>
      
      <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
        {tags.map((tag, idx) => (
          <div key={idx} className="flex flex-col bg-[#1f1f23] border border-white/5 rounded-xl px-4 py-2 min-w-max hover:border-[#f6339a]/50 hover:bg-[#2a2a35] cursor-pointer transition-colors shadow-sm">
            <span className="text-[13px] font-bold text-white">#{tag.name}</span>
            <span className="text-[10px] text-gray-400">{tag.posts} publicaciones</span>
          </div>
        ))}
      </div>
    </div>
  );
}
