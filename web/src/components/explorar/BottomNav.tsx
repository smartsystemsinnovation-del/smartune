'use client';

export default function BottomNav() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#121216]/90 backdrop-blur-md border-t border-[#2a2a35] pb-safe">
      <div className="max-w-2xl mx-auto flex justify-between items-center h-16 px-6 relative">
        {/* Home */}
        <button className="text-gray-400 hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3L4 9v12h5v-7h6v7h5V9z" />
          </svg>
        </button>
        
        {/* Search */}
        <button className="text-gray-400 hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"></circle>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"></path>
          </svg>
        </button>

        {/* Floating Action / Create */}
        <div className="relative -top-6">
          <button 
             className="w-14 h-14 bg-[#f6339a] rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(246,51,154,0.6)] hover:scale-105 transition-transform"
             onClick={() => {
                const el = document.getElementById('create-post-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
             }}
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path>
            </svg>
          </button>
        </div>

        {/* Library */}
        <button className="text-gray-400 hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12zM10 9h8v2h-8zm0 3h4v2h-4zm0-6h8v2h-8z"/>
          </svg>
        </button>

        {/* Profile */}
        <button className="text-gray-400 hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
