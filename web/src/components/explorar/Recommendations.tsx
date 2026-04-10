"use client";

import React from "react";

export default function Recommendations() {
  const items = [
    { label: 'UI/UX', icon: '✕', bg: 'bg-[#1e1435]', border: 'border-[#2e1e42]', shape: 'rounded-[30%_70%_50%_50%/45%_40%_60%_55%]' },
    { label: 'Music', icon: '♪', bg: 'bg-[#2a1540]', border: 'border-[#9810fa]/20', shape: 'rounded-full' },
    { label: 'Cooking', icon: '🍳', bg: 'bg-[#1e1435]', border: 'border-[#2e1e42]', shape: 'rounded-full' },
    { label: 'Hiking', icon: '⛰', bg: 'bg-[#2a1540]', border: 'border-[#9810fa]/20', shape: 'rounded-2xl' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item) => (
        <div key={item.label} className="aspect-square cursor-pointer group">
          <div className={`w-full h-full ${item.shape} ${item.bg} border ${item.border} flex flex-col items-center justify-center gap-2 hover:border-[#9810fa]/40 transition-colors`}>
            <span className="text-2xl group-hover:scale-110 transition-transform">{item.icon}</span>
            <span className="text-[12px] font-semibold text-white/60">{item.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
