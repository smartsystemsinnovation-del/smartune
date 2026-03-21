import Feed from '@/components/explorar/Feed';
import BottomNav from '@/components/explorar/BottomNav';
import StoriesRow from '@/components/explorar/StoriesRow';
import RecentFollowers from '@/components/explorar/RecentFollowers';
import TrendingHashtags from '@/components/explorar/TrendingHashtags';
import LeftSidebar from '@/components/explorar/LeftSidebar';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { getFeed } from '@/actions/socialActions';

export default async function ExplorarPage() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login?redirectTo=/explorar');
  }

  const { data: profile } = await supabase
    .from('usuarios')
    .select('avatar_url, nombre')
    .eq('id', user.id)
    .single();

  const feedRes = await getFeed();
  const initialPosts = feedRes.success && feedRes.data ? feedRes.data : [];

  return (
    <main className="bg-[#0e0e12] min-h-screen text-white font-sans">

      {/* ─── TOP SEARCH BAR (Figma) ─── */}
      <header className="sticky top-0 z-50 bg-[#16161d] border-b border-[#2a2a35]/60">
        <div className="max-w-[1400px] mx-auto flex items-center gap-4 px-6 py-2.5">
          {/* Search Input */}
          <div className="flex-1 relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search for tracks, teachers, or vibes..."
              className="w-full bg-[#1f1f2a] text-sm text-gray-300 rounded-full pl-11 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#f6339a]/50 border border-[#2a2a35] placeholder-gray-500"
            />
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 rounded-full bg-[#1f1f2a] border border-[#2a2a35] flex items-center justify-center text-gray-400 hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
            </button>
            <button className="w-9 h-9 rounded-full bg-[#1f1f2a] border border-[#2a2a35] flex items-center justify-center text-gray-400 hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>
            </button>
            {/* User Avatar */}
            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#f6339a] bg-[#1f1f2a]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={profile?.avatar_url || 'https://utfs.io/f/cd2bb812-a1f9-4675-9257-238b6c0fe1b8-c906oz.png'} alt="Avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </header>

      {/* ─── 3 COLUMN LAYOUT (Figma) ─── */}
      <div className="max-w-[1400px] mx-auto flex">

        {/* LEFT SIDEBAR - Hidden on mobile */}
        <aside className="hidden lg:flex flex-col w-[240px] xl:w-[260px] flex-shrink-0 sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto border-r border-[#2a2a35]/40 py-6 px-5">
          <LeftSidebar userName={profile?.nombre || 'Usuario'} />
        </aside>

        {/* CENTER FEED COLUMN */}
        <div className="flex-1 min-w-0 border-r border-[#2a2a35]/40 lg:border-r">
          <Feed
            initialPosts={initialPosts}
            currentUserId={user.id}
            currentUserAvatar={profile?.avatar_url}
          />

          {/* NOVEDADES (Figma has stories near the bottom) */}
          <div className="px-5 pb-6">
            <h3 className="text-[11px] font-bold text-gray-500 tracking-widest uppercase mb-4 flex items-center gap-2">
              <span className="text-[#f6339a]">#</span> Novedades
            </h3>
            <StoriesRow currentUserAvatar={profile?.avatar_url} />
          </div>
        </div>

        {/* RIGHT SIDEBAR - Hidden on mobile */}
        <aside className="hidden lg:flex flex-col w-[300px] xl:w-[330px] flex-shrink-0 sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto py-6 px-5 gap-6">
          <TrendingHashtags />
          <RecentFollowers />
        </aside>

      </div>

      <BottomNav />
    </main>
  );
}
