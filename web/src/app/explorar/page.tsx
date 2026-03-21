import Feed from '@/components/explorar/Feed';
import BottomNav from '@/components/explorar/BottomNav';
import StoriesRow from '@/components/explorar/StoriesRow';
import RecentFollowers from '@/components/explorar/RecentFollowers';
import TrendingHashtags from '@/components/explorar/TrendingHashtags';
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
    <div className="min-h-screen pb-12" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex gap-8">
          
          {/* ─── CENTER COLUMN (Feed) ─── */}
          <div className="flex-1 min-w-0 space-y-10 pt-8">

            {/* Novedades (Stories) */}
            <section>
              <h2 className="text-sm font-headline font-bold tracking-widest text-gray-400 uppercase mb-6 px-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Novedades
              </h2>
              <StoriesRow currentUserAvatar={profile?.avatar_url} />
            </section>

            {/* Feed (Composer + Posts) */}
            <Feed
              initialPosts={initialPosts}
              currentUserId={user.id}
              currentUserAvatar={profile?.avatar_url}
            />
          </div>

          {/* ─── RIGHT SIDEBAR ─── */}
          <aside className="hidden xl:flex flex-col w-80 flex-shrink-0 gap-8 pt-8">
            <TrendingHashtags />
            <RecentFollowers />
          </aside>

        </div>
      </div>

      <BottomNav />
    </div>
  );
}
