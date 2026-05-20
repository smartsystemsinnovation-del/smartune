// Explorar — Minimalist Social Feed with SmarTune palette
import Feed from '@/components/explorar/Feed';
import StoriesRow from '@/components/explorar/StoriesRow';
import RecentFollowers from '@/components/explorar/RecentFollowers';
import CreatePostModal from '@/components/explorar/CreatePostModal';
import SidebarHeaderButtons from '@/components/explorar/SidebarHeaderButtons';
import { createClient } from '@/utils/supabase/server';
import AuthGatekeeper from '@/components/AuthGatekeeper';
import { getFeed } from '@/actions/socialActions';
import Script from 'next/script';
import AdSenseUnit from '@/components/AdSenseUnit';
import AdsterraSponsoredCard from '@/components/AdsterraSponsoredCard';

export default async function ExplorarPage() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center p-6">
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
    <div className="min-h-screen text-white antialiased font-sans">
      <Script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8388922041059415" crossOrigin="anonymous" strategy="afterInteractive" />

      {/* ── LAYOUT: feed | sidebar ── */}
      <div className="flex justify-center w-full min-h-screen">
        <div className="flex w-full max-w-[960px] justify-between lg:gap-0 px-4 sm:px-6">

          {/* ═══ FEED CENTRAL ═══ */}
          <main className="w-full max-w-[580px] flex-1 min-w-0 pt-6 lg:pt-8 pb-32">
            
            {/* Stories (solo móvil) */}
            <div className="lg:hidden mb-5">
              <StoriesRow currentUserAvatar={profile?.avatar_url} />
            </div>

            {/* Crear post mobile */}
            <div className="lg:hidden w-full mb-5">
              <CreatePostModal avatarUrl={profile?.avatar_url} />
            </div>

            {/* Adsterra Sponsored In-Feed Card */}
            <div className="w-full mb-6">
              <AdsterraSponsoredCard isFeed={true} />
            </div>

            {/* Feed */}
            <Feed
              initialPosts={initialPosts}
              currentUserId={user.id}
              currentUserAvatar={profile?.avatar_url}
            />
          </main>

          {/* ═══ SIDEBAR (desktop) ═══ */}
          <aside className="hidden lg:flex flex-col w-[280px] shrink-0 sticky top-0 h-screen overflow-y-auto hide-scrollbar"
            style={{ borderLeft: '1px solid rgba(255,255,255,0.03)' }}
          >
            <div className="flex flex-col gap-6 p-5 pt-8">

              {/* Header — Avatar + settings */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="relative w-9 h-9">
                    <img
                      src={profile?.avatar_url || `https://ui-avatars.com/api/?background=1a1d23&color=fff&bold=true&size=128&name=${encodeURIComponent(profile?.nombre || 'U')}`}
                      alt="Perfil"
                      className="w-full h-full rounded-full object-cover"
                      style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                    />
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2"
                      style={{ background: '#34d399', borderColor: 'var(--bg-main)' }}
                    />
                  </div>
                  <span className="text-[13px] font-semibold text-white/70">{profile?.nombre?.split(' ')[0] || 'Usuario'}</span>
                </div>
                <SidebarHeaderButtons />
              </div>

              {/* Stories Desktop */}
              <section className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--neon-pink)' }} />
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>Historias</h3>
                </div>
                <StoriesRow currentUserAvatar={profile?.avatar_url} />
              </section>

              {/* Sugerencias */}
              <section className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>Sugerencias</h3>
                  <button className="text-[11px] font-semibold transition-opacity hover:opacity-70" style={{ color: 'var(--neon-pink)' }}>
                    Ver todo
                  </button>
                </div>
                <RecentFollowers />
              </section>

              {/* Adsterra Sidebar Sponsored Card */}
              <AdsterraSponsoredCard />

              {/* Publicar */}
              <CreatePostModal avatarUrl={profile?.avatar_url} />

              {/* Footer */}
              <footer className="px-1 pb-4">
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.12)' }}>
                  <a href="#" className="hover:text-white/30 transition-colors">Acerca de</a>
                  <a href="#" className="hover:text-white/30 transition-colors">Ayuda</a>
                  <a href="#" className="hover:text-white/30 transition-colors">Privacidad</a>
                  <a href="#" className="hover:text-white/30 transition-colors">Términos</a>
                </div>
                <p className="text-[10px] mt-2" style={{ color: 'rgba(255,255,255,0.08)' }}>© 2026 SmarTune</p>
              </footer>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}