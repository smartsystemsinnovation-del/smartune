// CAMBIOS:
// - Layout de 3 columnas (sidebar izq | feed central | sidebar der) en desktop
// - Feed central max-w-[600px] para uniformidad total de cards
// - Sidebar derecha: Stories + Friend Suggestions + slot de anuncio Google AdSense
// - CreatePost sticky en la parte superior del feed
// - Fondo #111315 unificado, colores coherentes con PostCard rediseñado
import Feed from '@/components/explorar/Feed';
import StoriesRow from '@/components/explorar/StoriesRow';
import RecentFollowers from '@/components/explorar/RecentFollowers';
import CreatePostModal from '@/components/explorar/CreatePostModal';
import SidebarHeaderButtons from '@/components/explorar/SidebarHeaderButtons';
import { createClient } from '@/utils/supabase/server';
import AuthGatekeeper from '@/components/AuthGatekeeper';
import { getFeed } from '@/actions/socialActions';

export default async function ExplorarPage() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return (
      <div className="min-h-screen bg-[#111315] text-white flex items-center justify-center p-6">
        <AuthGatekeeper
          iconNode={
            <div style={{ width: 80, height: 80, borderRadius: '50%', border: '2px solid var(--neon-pink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--neon-pink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          }
          titlePath1="Crea una cuenta para explorar"
          titleHighlight="SmarTune Social"
          subtitle="Únete a la comunidad musical donde podrás compartir tu progreso, descubrir nuevos talentos y conectar con músicos de todo el mundo."
          cardIcon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--neon-pink)" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-14.7 8.38 8.38 0 0 1 3.8.9L21 2l-1.1 4.5V11.5z" /></svg>}
          cardTitle="Beneficios de SmarTune Social:"
          benefits={[
            { text: "Comparte tus grabaciones y recibe apoyo de la comunidad" },
            { text: "Sigue a tus artistas y profesores favoritos" },
            { text: "Mantente al tanto de las últimas tendencias musicales" },
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
    <div className="min-h-screen bg-[#111315] text-white antialiased font-sans selection:bg-[#3B82F6]/30">

      {/* ── LAYOUT PRINCIPAL: feed | sidebar der ── */}
      <div className="flex justify-center w-full min-h-screen">
        <div className="flex w-full max-w-[1000px] justify-between lg:gap-8 xl:gap-12 px-4 sm:px-6">

          {/* ═══ COLUMNA CENTRAL ═══ */}
          <main className="w-full max-w-[600px] flex-1 min-w-0 pt-6 lg:pt-8 pb-32">
            
            {/* Stories (solo móvil) */}
            <div className="lg:hidden mb-5">
              <StoriesRow currentUserAvatar={profile?.avatar_url} />
            </div>

            {/* Add New Post — botón flotante (mobile) -> lo movemos a CreatePostModal si se quiere, o lo dejamos aquí pero abriendo modal.
                Como CreatePostModal ya tiene su botón y es full width, reemplazaremos esto para no duplicar código, o lo adaptaremos luego.
                Por ahora el modal en sidebar cubre escritorio. Para móvil agregaremos el Modal aquí: */}
            <div className="lg:hidden w-full mb-5 px-2">
              <CreatePostModal avatarUrl={profile?.avatar_url} />
            </div>

            {/* ── SLOT ANUNCIO GOOGLE ADSENSE (in-feed) ── */}
            {/* CAMBIO: Slot preparado para insertar anuncio entre el CreatePost y el Feed.
                Para activar: reemplaza el div interno con el script de AdSense correspondiente.
                Documentación: https://support.google.com/adsense/answer/7480870 */}
            <div id="ad-slot-feed" className="w-full rounded-2xl overflow-hidden mb-6 border border-white/[0.05] bg-[#1a1d23] min-h-[90px] flex items-center justify-center">
              {/* INSERT GOOGLE ADSENSE SCRIPT HERE */}
              <span className="text-[11px] text-white/10 select-none">Espacio publicitario</span>
            </div>

            {/* Feed principal */}
            <Feed
              initialPosts={initialPosts}
              currentUserId={user.id}
              currentUserAvatar={profile?.avatar_url}
            />
          </main>

        {/* ═══ SIDEBAR DERECHA (solo desktop) ═══ */}
        <aside className="hidden lg:flex flex-col w-[300px] shrink-0 sticky top-0 h-screen border-l border-white/[0.05] bg-[#111315] overflow-y-auto hide-scrollbar">
          <div className="flex flex-col gap-5 p-5 pt-8">

            {/* Header del sidebar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {/* Avatar del usuario actual con indicador online */}
                <div className="relative w-9 h-9">
                  <img
                    src={profile?.avatar_url || `https://ui-avatars.com/api/?background=1a1d23&color=fff&bold=true&size=128&name=${encodeURIComponent(profile?.nombre || 'U')}`}
                    alt="Perfil"
                    className="w-full h-full rounded-full object-cover border border-white/10"
                  />
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-[#111315]" />
                </div>
              </div>
              <SidebarHeaderButtons />
            </div>

            {/* ── Stories Desktop ── */}
            <section className="bg-[#111315] border border-white/[0.05] rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#f6339a] to-[#9810fa]" />
                <h3 className="text-[13px] font-bold text-white/80">Historias</h3>
              </div>
              <StoriesRow currentUserAvatar={profile?.avatar_url} />
            </section>

            {/* ── Friend Suggestions ── */}
            {/* CAMBIO: Título "Friend Suggestions" + "See All →" como en la foto */}
            <section className="bg-[#111315] border border-white/[0.05] rounded-2xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[13px] font-bold text-white/80">Friend Suggestions</h3>
                <button className="text-[12px] font-bold text-[#f6339a] hover:text-[#f6339a]/80 flex items-center gap-1 transition-colors">
                  See All
                  <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <RecentFollowers />
            </section>

            {/* ── SLOT ANUNCIO GOOGLE ADSENSE (sidebar) ── */}
            {/* CAMBIO: Slot preparado para banner 300x250 (Rectangle) de Google AdSense.
                Para activar: reemplaza el contenido interno con tu script de AdSense.
                Tamaño recomendado para sidebar: 300x250 o 300x600. */}
            <div id="ad-slot-sidebar" className="w-full rounded-2xl overflow-hidden border border-white/[0.05] bg-[#1a1d23] min-h-[250px] flex items-center justify-center">
              {/* INSERT GOOGLE ADSENSE 300x250 SCRIPT HERE */}
              <span className="text-[11px] text-white/10 select-none">Anuncio 300×250</span>
            </div>

            {/* ── BOTÓN PUBLICAR NUEVO POST (Modal) ── */}
            <CreatePostModal avatarUrl={profile?.avatar_url} />

            {/* Footer */}
            <footer className="px-1 pb-4">
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-white/20 font-medium">
                <a href="#" className="hover:text-white/50 transition-colors">Acerca de</a>
                <a href="#" className="hover:text-white/50 transition-colors">Ayuda</a>
                <a href="#" className="hover:text-white/50 transition-colors">Privacidad</a>
                <a href="#" className="hover:text-white/50 transition-colors">Términos</a>
              </div>
              <p className="text-[11px] text-white/15 mt-2">© 2026 SmarTune. Todos los derechos reservados.</p>
            </footer>
          </div>
        </aside>

        </div>
      </div>

      {/* ── BOTTOM NAV (móvil) ── */}
      {/* Se mantiene el componente BottomNav existente importado en layout */}
    </div>
  );
}