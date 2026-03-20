import Feed from '@/components/explorar/Feed';
import BottomNav from '@/components/explorar/BottomNav';
import StoriesRow from '@/components/explorar/StoriesRow';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { getFeed } from '@/actions/socialActions';
import styles from './page.module.css';

export default async function ExplorarPage() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login?redirectTo=/explorar');
  }

  const { data: profile } = await supabase
    .from('usuarios')
    .select('avatar_url')
    .eq('id', user.id)
    .single();

  const feedRes = await getFeed();
  const initialPosts = feedRes.success && feedRes.data ? feedRes.data : [];

  return (
    <main className="bg-[#0e0e12] min-h-screen text-white font-sans relative pb-24">
      {/* Custom Header matching Figma */}
      <header className="sticky top-0 z-50 bg-[#0e0e12]/95 backdrop-blur-md px-4 py-3 flex justify-between items-center border-b border-[#2a2a35]/50">
        <div className="flex items-center gap-2">
          <svg className="w-6 h-6 text-[#f6339a]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
          <span className="font-bold italic text-xl tracking-tight">SmarTune</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-[#f6339a] hover:text-[#ff4db8] transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/>
            </svg>
          </button>
          <button className="w-6 h-6 rounded-full bg-[#fbbc05] flex items-center justify-center text-black">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
            </svg>
          </button>
        </div>
      </header>
      
      <div className="w-full max-w-2xl mx-auto">
        <div className="px-4 mt-6 mb-2">
          <h1 className="text-2xl font-black text-[#f6339a] tracking-wide">
            Feed Musical
          </h1>
        </div>

        <StoriesRow />

        <div className="px-4 mt-4">
          <Feed 
            initialPosts={initialPosts} 
            currentUserId={user.id} 
            currentUserAvatar={profile?.avatar_url}
          />
        </div>
      </div>
      
      <BottomNav />
    </main>
  );
}
