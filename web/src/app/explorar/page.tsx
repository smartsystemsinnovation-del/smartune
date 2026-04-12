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
    <div className="min-h-screen bg-[#0a0a0a] text-white antialiased pb-24 font-sans selection:bg-[#f6339a]/30 selection:text-white">

      {/* ── CONTENEDOR MAESTRO ── */}
      <div className="w-full flex justify-center pt-8 lg:pt-16 px-4 sm:px-6">

        {/* ── WRAPPER DE COLUMNAS ── */}
        <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12 w-full max-w-[1000px] justify-center">

          {/* ═════════ COLUMNA PRINCIPAL (FEED) ═════════ */}
          <main className="w-full max-w-[600px] min-w-0 mx-auto lg:mx-0 flex flex-col gap-6">

            {/* Stories Móvil (Solo visible en pantallas pequeñas) */}
            <div className="lg:hidden mb-2">
              <div className="flex items-center gap-2 mb-4 px-2">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#f6339a] to-[#9810fa]"></div>
                <h2 className="text-[15px] font-bold tracking-wide">Historias</h2>
              </div>
              <StoriesRow currentUserAvatar={profile?.avatar_url} />
            </div>

            {/* Creador de Posts (Movido al centro para lucir el nuevo diseño) */}
            <div className="mb-2">
              <CreatePost avatarUrl={profile?.avatar_url} />
            </div>

            {/* Feed Principal */}
            <Feed
              initialPosts={initialPosts}
              currentUserId={user.id}
              currentUserAvatar={profile?.avatar_url}
            />
          </main>

          {/* ═════════ SIDEBAR DERECHA ═════════ */}
          <aside className="hidden lg:flex flex-col w-[320px] shrink-0 sticky top-24 gap-8">

            {/* Widget: Stories Desktop */}
            <section className="bg-[#0f0f0f] border border-white/[0.05] rounded-[24px] p-5 shadow-lg">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#f6339a] to-[#9810fa] shadow-[0_0_8px_rgba(246,51,154,0.6)]"></div>
                <h3 className="text-[15px] font-bold tracking-wide text-white/90">Historias Destacadas</h3>
              </div>
              <StoriesRow currentUserAvatar={profile?.avatar_url} />
            </section>

            {/* Widget: Sugerencias */}
            <section className="bg-[#0f0f0f] border border-white/[0.05] rounded-[24px] p-5 shadow-lg">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-white/20"></div>
                  <h3 className="text-[15px] font-bold tracking-wide text-white/90">A quién seguir</h3>
                </div>
                <button className="text-[11px] font-bold text-[#f6339a] hover:text-white transition-colors tracking-wider uppercase">
                  Ver Todo
                </button>
              </div>
              <RecentFollowers />
            </section>

            {/* Footer sutil en la barra lateral */}
            <footer className="px-2 mt-4">
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-white/30 font-medium">
                <a href="#" className="hover:text-white transition-colors">Acerca de</a>
                <a href="#" className="hover:text-white transition-colors">Ayuda</a>
                <a href="#" className="hover:text-white transition-colors">Privacidad</a>
                <a href="#" className="hover:text-white transition-colors">Términos</a>
              </div>
              <p className="text-[11px] text-white/20 mt-3">© 2026 SmartTune. Todos los derechos reservados.</p>
            </footer>

          </aside>

        </div>
      </div>
    </div>
  );
}