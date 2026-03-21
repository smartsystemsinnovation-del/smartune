"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface LeftSidebarProps {
  userName: string;
}

export default function LeftSidebar({ userName }: LeftSidebarProps) {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Home', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3L4 9v12h5v-7h6v7h5V9z" /></svg> },
    { href: '/explorar', label: 'Descubre', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" /></svg> },
    { href: '/profesores', label: 'Profesores', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg> },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="mb-8">
        <Link href="/" className="flex items-center gap-2 group">
          <svg className="w-7 h-7 text-[#f6339a]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
          <span className="text-[#f6339a] font-bold italic text-xl tracking-tight group-hover:text-[#ff4db8] transition-colors">SmarTune</span>
        </Link>
      </div>

      {/* Menu Label */}
      <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mb-3">Menú</p>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 mb-8">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-all ${
                isActive
                  ? 'bg-[#f6339a]/10 text-[#f6339a] font-bold'
                  : 'text-gray-400 hover:text-white hover:bg-[#1f1f2a]'
              }`}
            >
              <span className={isActive ? 'text-[#f6339a]' : 'text-gray-500'}>{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Playlist & Favorites */}
      <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mb-3">Playlist and favorites</p>
      <div className="flex flex-col gap-1 mb-8">
        <Link href="/favoritos" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] text-gray-400 hover:text-white hover:bg-[#1f1f2a] transition-all font-medium">
          <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
          Mi playlist
        </Link>
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] text-gray-400 hover:text-white hover:bg-[#1f1f2a] transition-all font-medium text-left">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Añadir playlist
        </button>
      </div>

      {/* Updates Section */}
      <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mb-3">Actualizaciones</p>
      <div className="flex flex-col gap-1 mb-8">
        <Link href="/explorar" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] text-gray-400 hover:text-white hover:bg-[#1f1f2a] transition-all font-medium">
          <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>
          Novedades
        </Link>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Hazte Profesor Label */}
      <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mb-3">Hazte profesor</p>
      <Link
        href="/teacher/dashboard"
        className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#f6339a] to-[#ff4db8] text-white font-bold text-sm py-3 px-4 rounded-xl hover:shadow-[0_0_20px_rgba(246,51,154,0.5)] transition-all mb-4"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
        Premium
      </Link>
    </div>
  );
}
