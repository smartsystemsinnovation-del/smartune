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
      <div className="max-w-[1100px] mx-auto px-8 lg:px-12 pt-12">
        <div className="flex flex-col lg:flex-row justify-center gap-12 lg:gap-20">

          {/* ═══ COLUMNA PRINCIPAL: Feed ═══ */}
          <main className="w-full max-w-[580px] mx-auto lg:mx-0">

            {/* Stories solo en móvil */}
            <div className="lg:hidden mb-10">
              <h2 className="text-lg font-bold text-white mb-4">Stories</h2>
              <StoriesRow currentUserAvatar={profile?.avatar_url} />
            </div>

            <Feed
              initialPosts={initialPosts}
              currentUserId={user.id}
              currentUserAvatar={profile?.avatar_url}
            />
          </main>

          {/* ═══ SIDEBAR DERECHA ═══ */}
          <aside className="hidden lg:block w-[280px] flex-shrink-0">
            <div className="sticky top-12 space-y-12">

              {/* Stories */}
              <section>
                <h3 className="text-[17px] font-bold text-white mb-5">Stories</h3>
                <StoriesRow currentUserAvatar={profile?.avatar_url} />
              </section>

              {/* Suggestions */}
              <section>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-[17px] font-bold text-white">Suggestions</h3>
                  <span className="text-[11px] text-white/25 cursor-pointer hover:text-white/50 transition-colors">See all</span>
                </div>
                <RecentFollowers />
              </section>

              {/* Recommendations */}
              <section>
                <h3 className="text-[17px] font-bold text-white mb-5">Recommendations</h3>
                <Recommendations />
              </section>

            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
