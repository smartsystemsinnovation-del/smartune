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
    <div className="min-h-screen pb-20 pt-8 px-4 bg-[#0d0714]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <div className="max-w-[1100px] mx-auto flex items-start flex-col lg:flex-row gap-8 lg:gap-14">
        
        {/* Columna Izquierda: Feeds */}
        <div className="w-full lg:w-[65%] min-w-0 max-w-[700px] mx-auto lg:mx-0">
          {/* Novedades visibles solo en móvil para no perder funcionalidad arriba */}
          <div className="lg:hidden mb-10 w-full overflow-hidden">
             <h2 className="text-[22px] font-bold text-white mb-4 tracking-tight">Stories</h2>
             <StoriesRow currentUserAvatar={profile?.avatar_url} />
          </div>

          {/* Componente Feed */}
          <Feed
            initialPosts={initialPosts}
            currentUserId={user.id}
            currentUserAvatar={profile?.avatar_url}
          />
        </div>

        {/* Columna Derecha: Sidebar */}
        <aside className="hidden lg:flex flex-col w-[35%] max-w-[340px] flex-shrink-0 gap-10 sticky top-12">
          {/* Stories */}
          <section>
            <h2 className="text-[20px] font-bold text-white mb-4">Stories</h2>
            <StoriesRow currentUserAvatar={profile?.avatar_url} />
          </section>

          {/* Suggestions */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[20px] font-bold text-white">Suggestions</h2>
              <button className="text-[12px] text-white/40 hover:text-white transition-colors">See all</button>
            </div>
            <RecentFollowers />
          </section>

          {/* Recommendations */}
          <section>
            <h2 className="text-[20px] font-bold text-white mb-4">Recommendations</h2>
            <Recommendations />
          </section>
        </aside>

      </div>
    </div>
  );
}
