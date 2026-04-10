"use client";

import React from "react";

export default function Recommendations() {
  return (
    <div className="grid grid-cols-2 gap-4">
      
      {/* Circle 1 - UI/UX (SmarTune: Piano) -> using a wavy circle approach */}
      <div className="aspect-square flex items-center justify-center cursor-pointer group hover:scale-105 transition-transform duration-300">
        <div 
           className="w-full h-full relative rounded-[35%] bg-gradient-to-tr from-[#9810fa]/40 to-[#0e9eef]/20 border border-white/[0.05] flex flex-col items-center justify-center gap-2 text-white overflow-hidden shadow-lg shadow-[#0e9eef]/5"
           style={{ borderRadius: '35% 65% 54% 46% / 47% 41% 59% 53%' }} // Wavy organic shape
        >
          <svg className="w-8 h-8 text-[#0e9eef] group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span className="font-bold text-[14px]">Music Theory</span>
        </div>
      </div>

      {/* Circle 2 - Music (SmarTune: Singing) -> pink circular UI with concentric rings */}
      <div className="aspect-square flex items-center justify-center cursor-pointer group hover:scale-105 transition-transform duration-300">
        <div className="w-full h-full rounded-full bg-gradient-to-br from-[#f6339a] to-[#ee10b0] flex flex-col items-center justify-center gap-2 text-white shadow-[0_0_25px_rgba(246,51,154,0.3)] border-4 border-[#181818] ring-4 ring-[#f6339a]/30 relative overflow-hidden">
             {/* Small visual concentric rings */}
             <div className="absolute inset-0 rounded-full border border-white/20 scale-75"></div>
             <div className="absolute inset-0 rounded-full border border-white/10 scale-50"></div>
             <svg className="w-8 h-8 relative z-10 group-hover:-translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>
             <span className="font-bold text-[14px] relative z-10">Vocals</span>
        </div>
      </div>

      {/* Circle 3 - Cooking -> Image of instruments */}
      <div className="aspect-square flex items-center justify-center cursor-pointer group hover:scale-105 transition-transform duration-300">
        <div className="w-full h-full rounded-full bg-gray-800 flex flex-col items-center justify-center text-white relative overflow-hidden shadow-lg border border-white/[0.05]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60" alt="Instruments" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
          <span className="font-bold text-[14px] relative z-10 bg-black/40 px-3 py-1 rounded-lg backdrop-blur-md">Guitar</span>
        </div>
      </div>

      {/* Square 4 - Purple rounded rect Hiking -> Gaming/Scores */}
      <div className="aspect-square flex items-center justify-center cursor-pointer group hover:scale-105 transition-transform duration-300">
        <div className="w-full h-full rounded-3xl bg-[#ba8cff] flex flex-col items-center justify-center gap-2 text-[#2e1e42] shadow-[0_0_20px_rgba(186,140,255,0.2)]">
           <svg className="w-8 h-8 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
           <span className="font-bold text-[14px]">Practices</span>
        </div>
      </div>

    </div>
  );
}
