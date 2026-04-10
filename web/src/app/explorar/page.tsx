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
    <div className="min-h-screen flex justify-center bg-[#fafafa] text-gray-900" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="w-full max-w-[600px] mx-auto px-0 sm:px-4 pt-6 pb-16">
        
        {/* Novedades (Stories) */}
        <section className="mb-6">
          <StoriesRow currentUserAvatar={profile?.avatar_url} />
        </section>

        {/* Feed */}
        <div className="mt-2">
          <Feed
            initialPosts={initialPosts}
            currentUserId={user.id}
            currentUserAvatar={profile?.avatar_url}
          />
        </div>
      </div>

      {/* Right Sidebar */}
      <aside className="hidden xl:block w-80 flex-shrink-0 pt-8 pl-8 hidden">
        {/* Removed for a cleaner look matching image or we can keep it without borders. 
            I'll keep it as the image is from mobile view presumably, or just hide to match the clean aesthetic. I am just putting 'hidden xl:block', same as before but keeping it simple */}
        <div className="sticky top-24 opacity-60 hover:opacity-100 transition-opacity">
          <RecentFollowers />
        </div>
      </aside>
    </div>
  );
}
