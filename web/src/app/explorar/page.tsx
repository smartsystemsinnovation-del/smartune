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
    <div className="min-h-screen flex justify-center" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <div className="w-full max-w-[600px] mx-auto px-4 pt-6 pb-12">
        
        {/* Novedades (Stories) */}
        <section className="mb-8">
          <h2 className="text-[11px] font-bold tracking-[0.2em] text-white/30 uppercase mb-5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Novedades
          </h2>
          <StoriesRow currentUserAvatar={profile?.avatar_url} />
        </section>

        {/* Feed */}
        <Feed
          initialPosts={initialPosts}
          currentUserId={user.id}
          currentUserAvatar={profile?.avatar_url}
        />
      </div>

      {/* Right Sidebar */}
      <aside className="hidden xl:block w-72 flex-shrink-0 pt-6 pl-8">
        <div className="sticky top-24">
          <RecentFollowers />
        </div>
      </aside>
    </div>
  );
}
