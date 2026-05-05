import Feed from '@/components/explorar/Feed';
import StoriesRow from '@/components/explorar/StoriesRow';
import RecentFollowers from '@/components/explorar/RecentFollowers';
import CreatePost from '@/components/explorar/CreatePost';
import { createClient } from '@/utils/supabase/server';
import AuthGatekeeper from '@/components/AuthGatekeeper';
import { getFeed } from '@/actions/socialActions';

export default async function ExplorarPage() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-6">
        <AuthGatekeeper 
          iconNode={
            <div style={{ width: 80, height: 80, borderRadius: '50%', border: '2px solid var(--neon-pink)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--neon-pink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
          }
          titlePath1="Crea una cuenta para explorar"
          titleHighlight="SmarTune Social"
          subtitle="Únete a la comunidad musical donde podrás compartir tu progreso, descubrir nuevos talentos y conectar con músicos de todo el mundo."
          cardIcon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--neon-pink)" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-14.7 8.38 8.38 0 0 1 3.8.9L21 2l-1.1 4.5V11.5z"></path></svg>}
          cardTitle="Beneficios de SmarTune Social:"
          benefits={[
            { text: "Comparte tus grabaciones y recibe apoyo de la comunidad" },
            { text: "Sigue a tus artistas y profesores favoritos" },
            { text: "Mantente al tanto de las últimas tendencias musicales" }
          ]}
        />
      </div>
    );
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
      <div className="w-full flex justify-center pt-6 lg:pt-12 px-4 sm:px-6">

        {/* ── WRAPPER DE COLUMNAS ── */}
        <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12 w-full max-w-[1100px] mx-auto justify-center">

          {/* ═════════ COLUMNA PRINCIPAL (FEED & EXPLORE) ═════════ */}
          <main className="w-full max-w-[600px] min-w-0 flex flex-col gap-6">

            {/* Stories Móvil (Solo visible en pantallas pequeñas) */}
            <div className="lg:hidden mt-2">
              <StoriesRow currentUserAvatar={profile?.avatar_url} />
            </div>

            {/* Creador de Posts (Sticky) */}
            <div className="sticky top-[110px] z-40 bg-[#0a0a0a] pb-4">
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
          <aside className="hidden lg:flex flex-col w-[320px] shrink-0 sticky top-24 gap-6">

            {/* Widget: Stories Desktop */}
            <section className="bg-[#0f0f0f] border border-white/[0.05] rounded-[24px] p-5 shadow-lg">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-[#f6339a] to-[#9810fa] shadow-[0_0_8px_rgba(246,51,154,0.6)]"></div>
                <h3 className="text-[15px] font-bold tracking-wide text-white/90">Historias Destacadas</h3>
              </div>
              <StoriesRow currentUserAvatar={profile?.avatar_url} />
            </section>

            {/* Widget: Sugerencias */}
            <section className="bg-[#0f0f0f] border border-white/[0.05] rounded-[24px] p-5 shadow-lg">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/20"></div>
                  <h3 className="text-[15px] font-bold tracking-wide text-white/90">A quién seguir</h3>
                </div>
                <button className="text-[11px] font-bold text-[#f6339a] hover:text-[#f6339a]/80 transition-colors tracking-wider uppercase">
                  Ver Todo
                </button>
              </div>
              <RecentFollowers />
            </section>

            {/* Footer sutil en la barra lateral */}
            <footer className="px-3 mt-2">
              <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-[11px] text-white/30 font-medium">
                <a href="#" className="hover:text-white transition-colors">Acerca de</a>
                <a href="#" className="hover:text-white transition-colors">Ayuda</a>
                <a href="#" className="hover:text-white transition-colors">Privacidad</a>
                <a href="#" className="hover:text-white transition-colors">Términos</a>
                <a href="#" className="hover:text-white transition-colors">Reglas de la Comunidad</a>
              </div>
              <p className="text-[11px] text-white/20 mt-4 font-light">© 2026 SmartTune. Todos los derechos reservados.</p>
            </footer>

          </aside>

        </div>
      </div>
    </div>
  );
}