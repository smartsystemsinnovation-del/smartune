import Navigation from '@/components/Navigation';
import Feed from '@/components/explorar/Feed';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { getFeed } from '@/actions/socialActions';
import styles from './page.module.css';

export default async function ExplorarPage() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  // 1. Protección de Ruta (Auth Guard Estricto)
  if (authError || !user) {
    redirect('/login?redirectTo=/explorar');
  }

  // Get user profile for avatar
  const { data: profile } = await supabase
    .from('usuarios')
    .select('avatar_url')
    .eq('id', user.id)
    .single();

  const feedRes = await getFeed();
  const initialPosts = feedRes.success ? feedRes.data : [];

  return (
    <main className={`${styles.main} bg-[#0f0f13] min-h-screen text-white font-sans`}>
      <Navigation />
      
      <div className="pt-24 w-full">
        <div className="max-w-2xl mx-auto px-4 mb-4">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">
            Comunidad <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f6339a] to-[#0e9eef]">SmarTune</span>
          </h1>
          <p className="text-gray-400">
            Comparte tus progresos, partituras y conecta con otros músicos.
          </p>
        </div>

        <Feed 
          initialPosts={initialPosts} 
          currentUserId={user.id} 
          currentUserAvatar={profile?.avatar_url}
        />
      </div>
    </main>
  );
}
