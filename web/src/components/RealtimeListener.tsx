'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import IncomingCallModal from './IncomingCallModal';

export default function RealtimeListener() {
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: any) => {
       if (session?.user) setUserId(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: string, session: any) => {
       setUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  if (!userId) return null;

  return <IncomingCallModal currentUserId={userId} />;
}
