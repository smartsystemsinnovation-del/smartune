import Feed from '@/components/explorar/Feed';
import StoriesRow from '@/components/explorar/StoriesRow';
import RecentFollowers from '@/components/explorar/RecentFollowers';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { getFeed } from '@/actions/socialActions';
import Recommendations from '@/components/explorar/Recommendations';

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
    <div className="min-h-screen bg-[#0d0714] pb-24" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10 pt-10">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">

          {/* ═══ COLUMNA PRINCIPAL: Feed ═══ */}
          <main className="flex-1 min-w-0 max-w-[660px] mx-auto lg:mx-0">

            {/* Stories solo en móvil */}
            <div className="lg:hidden mb-8">
              <h2 className="text-lg font-bold text-white mb-3">Stories</h2>
              <StoriesRow currentUserAvatar={profile?.avatar_url} />
            </div>

            <Feed
              initialPosts={initialPosts}
              currentUserId={user.id}
              currentUserAvatar={profile?.avatar_url}
            />
          </main>

          {/* ═══ SIDEBAR DERECHA ═══ */}
          <aside className="hidden lg:block w-[300px] flex-shrink-0">
            <div className="sticky top-10 space-y-10">

              {/* Stories */}
              <section>
                <h3 className="text-[18px] font-bold text-white mb-4">Stories</h3>
                <StoriesRow currentUserAvatar={profile?.avatar_url} />
              </section>

              {/* Suggestions */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[18px] font-bold text-white">Suggestions</h3>
                  <span className="text-[12px] text-white/30 cursor-pointer hover:text-white/60 transition-colors">See all</span>
                </div>
                <RecentFollowers />
              </section>

              {/* Recommendations */}
              <section>
                <h3 className="text-[18px] font-bold text-white mb-4">Recommendations</h3>
                <Recommendations />
              </section>

            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
