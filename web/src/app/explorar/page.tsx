import Feed from '@/components/explorar/Feed';
import StoriesRow from '@/components/explorar/StoriesRow';
import RecentFollowers from '@/components/explorar/RecentFollowers';
import CreatePost from '@/components/explorar/CreatePost';
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
    <div className="min-h-screen bg-[#181818] pb-24" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>

      {/* CONTENEDOR MAESTRO: Centrado absoluto con flex */}
      <div className="w-full flex justify-center pt-16 px-6">

        {/* WRAPPER DE COLUMNAS: max-w-none para que no se pegue a la izquierda en pantallas gigantes */}
        <div className="flex flex-row items-start gap-12 xl:gap-20 w-full max-w-[1000px] justify-center">

          {/* ═══ COLUMNA PRINCIPAL ═══ */}
          <main className="w-full max-w-[580px] min-w-0">
            {/* Stories móvil (solo aparece si la pantalla es pequeña) */}
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
          <aside className="hidden lg:block w-[320px] shrink-0">
            <div className="sticky top-12 space-y-12">
              {/* Stories Desktop */}
              <section>
                <h3 className="text-[17px] font-bold text-white mb-5">Stories</h3>
                <StoriesRow currentUserAvatar={profile?.avatar_url} />
              </section>

              {/* Sugerencias */}
              <section>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-[17px] font-bold text-white">Sugerencias</h3>
                  <span className="text-[11px] text-white/25 cursor-pointer hover:text-white/50 transition-colors">
                    Ver todos
                  </span>
                </div>
                <RecentFollowers />
              </section>

              {/* Nueva Publicación */}
              <section>
                <div className="flex items-center gap-2 mb-5">
                  <div className="flex-1" style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.18)', fontWeight: 700, letterSpacing: '0.1em' }}>NUEVA PUBLICACIÓN</span>
                  <div className="flex-1" style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />
                </div>
                <CreatePost avatarUrl={profile?.avatar_url} />
              </section>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}