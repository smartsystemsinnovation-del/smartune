'use client';

import { useRouter } from 'next/navigation';

export default function SidebarHeaderButtons() {
  const router = useRouter();

  return (
    <div className="flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
      {/* Ajustes */}
      <button
        onClick={() => router.push('/profile')}
        title="Ajustes de perfil"
        className="w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200"
        onMouseEnter={e => {
          const el = e.currentTarget;
          el.style.filter = 'drop-shadow(0 0 6px rgba(152,16,250,0.5))';
          el.style.color = '#9810fa';
          el.style.background = 'rgba(152,16,250,0.08)';
        }}
        onMouseLeave={e => {
          const el = e.currentTarget;
          el.style.filter = 'none';
          el.style.color = 'rgba(255,255,255,0.3)';
          el.style.background = 'transparent';
        }}
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>
    </div>
  );
}
