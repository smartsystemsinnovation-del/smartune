import Feed from '@/components/explorar/Feed';
import StoriesRow from '@/components/explorar/StoriesRow';
import RecentFollowers from '@/components/explorar/RecentFollowers';
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
    <div className="min-h-screen" style={{ fontFamily: "'Manrope', sans-serif" }}>
      {/* Centered container */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 relative">
        <div className="flex gap-8 justify-center">
          
          {/* ─── CENTER COLUMN (Feed) ─── */}
          <div className="flex-1 min-w-0 max-w-2xl space-y-10 pt-8 pb-12">

            {/* Novedades (Stories) */}
            <section>
              <h2 className="text-sm font-bold tracking-widest text-gray-500 uppercase mb-6 px-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
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

          {/* ─── RIGHT SIDEBAR (only on xl screens) ─── */}
          <aside className="hidden xl:flex flex-col w-72 flex-shrink-0 gap-6 pt-8">
            <RecentFollowers />
          </aside>

        </div>
      </div>
    </div>
  );
}
