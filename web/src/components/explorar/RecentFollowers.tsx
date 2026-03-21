import React from 'react';

export default function RecentFollowers() {
  const followers = [
    { id: 1, name: 'Carlos_Guitar', time: 'Hace 2h', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop' },
    { id: 2, name: 'Sonia_Keys', time: 'Hace 5h', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' },
    { id: 3, name: 'MarianoBass', time: 'Hace 1d', img: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop' },
  ];

  if (!followers.length) return null;

  return (
    <div className="w-full px-4 mb-6">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-[14px] font-bold text-white tracking-wide">
          Nuevos Seguidores
        </h2>
        <span className="text-[12px] text-[#0e9eef] cursor-pointer hover:underline">Ver todos</span>
      </div>
      
      <div className="flex flex-col gap-3">
        {followers.map(user => (
          <div key={user.id} className="flex items-center justify-between bg-[#1f1f23] p-3 rounded-2xl border border-white/5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-[#2a2a35]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={user.img} alt={user.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-white">{user.name}</span>
                <span className="text-[11px] text-gray-400">Te comenzó a seguir • {user.time}</span>
              </div>
            </div>
            <button className="px-4 py-1.5 bg-[#f6339a]/10 text-[#f6339a] text-[12px] font-bold rounded-full hover:bg-[#f6339a] hover:text-white transition-colors border border-[#f6339a]/20">
              Seguir
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
