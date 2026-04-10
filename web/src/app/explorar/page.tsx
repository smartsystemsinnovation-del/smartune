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
    <div className="min-h-screen pb-20 pt-8 px-4" style={{ fontFamily: "'Inter', sans-serif" }}>
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
        <aside className="hidden lg:flex flex-col w-[35%] max-w-[380px] flex-shrink-0 gap-12 sticky top-12">
          {/* Stories */}
          <section>
            <h2 className="text-[24px] font-bold text-white mb-5 tracking-tight">Stories</h2>
            <StoriesRow currentUserAvatar={profile?.avatar_url} />
          </section>

          {/* Suggestions */}
          <section>
            <h2 className="text-[24px] font-bold text-white mb-5 tracking-tight">Suggestions</h2>
            <RecentFollowers />
          </section>

          {/* Recommendations Component */}
          <section>
            <h2 className="text-[24px] font-bold text-white mb-5 tracking-tight">Recommendations</h2>
            <Recommendations />
          </section>
        </aside>

      </div>
    </div>
  );
}
