"use client";

import React from "react";

export default function Recommendations() {
  return (
    <div className="grid grid-cols-2 gap-3">
      
      {/* 1 - UI/UX -> wavy organic blob shape with dark purple bg */}
      <div className="aspect-square flex items-center justify-center cursor-pointer group">
        <div 
           className="w-full h-full relative bg-[#2a1a40]/60 border border-[#9810fa]/20 flex flex-col items-center justify-center gap-2 text-white overflow-hidden hover:border-[#9810fa]/40 transition-colors"
           style={{ borderRadius: '35% 65% 54% 46% / 47% 41% 59% 53%' }}
        >
          <svg className="w-7 h-7 text-white/70 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" /></svg>
          <span className="font-bold text-[13px] text-white/80">UI/UX</span>
        </div>
      </div>

      {/* 2 - Music -> circular with magenta/pink accent */}
      <div className="aspect-square flex items-center justify-center cursor-pointer group">
        <div className="w-full h-full rounded-full bg-[#ea88ff]/15 border border-[#ea88ff]/25 flex flex-col items-center justify-center gap-2 text-white relative overflow-hidden hover:border-[#ea88ff]/50 transition-colors">
             <svg className="w-7 h-7 text-[#ea88ff] group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/></svg>
             <span className="font-bold text-[13px] text-white/80">Music</span>
        </div>
      </div>

      {/* 3 - Cooking -> image-backed circle */}
      <div className="aspect-square flex items-center justify-center cursor-pointer group">
        <div className="w-full h-full rounded-full bg-[#2a1a40] flex flex-col items-center justify-center text-white relative overflow-hidden border border-white/5 hover:border-white/15 transition-colors">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60" alt="Instruments" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-50 transition-opacity" />
          <span className="font-bold text-[13px] relative z-10 text-white/90">Cooking</span>
        </div>
      </div>

      {/* 4 - Hiking -> soft purple rounded rect */}
      <div className="aspect-square flex items-center justify-center cursor-pointer group">
        <div className="w-full h-full rounded-3xl bg-[#9810fa]/20 border border-[#9810fa]/20 flex flex-col items-center justify-center gap-2 text-white hover:border-[#9810fa]/40 transition-colors">
           <svg className="w-7 h-7 text-[#9810fa] group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 21l1.65-3.8a9 9 0 1112.712-12.712A9 9 0 013 21l3.8-1.65"/></svg>
           <span className="font-bold text-[13px] text-white/80">Hiking</span>
        </div>
      </div>

    </div>
  );
}
