import { createClient } from '@/utils/supabase/server';
import CreateClassForm from './CreateClassForm';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function CreateClassPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: students } = await supabase
    .from('teacher_students_view')
    .select('*')
    .eq('teacher_id', user.id);

  return (
    <div className="min-h-screen text-white font-sans">
      <div className="flex flex-col items-center justify-start min-h-screen px-4 sm:px-6 pt-10 pb-20">
        <div className="w-full max-w-[600px]">

          {/* Back */}
          <Link href="/teacher/clases">
            <span className="inline-flex items-center gap-1.5 text-white/30 hover:text-white/60 transition-colors text-xs mb-8 cursor-pointer select-none">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              SmartRoom
            </span>
          </Link>

          {/* ── Header ── */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(52,168,83,0.1)', border: '1px solid rgba(52,168,83,0.15)' }}>
              <svg className="w-5 h-5" style={{ color: '#34A853' }} fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
              </svg>
            </div>
            <div>
              <p className="text-[11px] text-white/30 uppercase tracking-[0.15em] font-semibold mb-0.5">Google Meet</p>
              <h1 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Nueva Sesión</h1>
            </div>
          </div>

          {/* ── Form Card ── */}
          <div className="rounded-2xl overflow-hidden"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid rgba(255,255,255,0.05)',
            }}>
            {/* Thin accent line */}
            <div className="h-[2px] w-full" style={{ background: 'linear-gradient(90deg, #34A853, #4285F4)' }} />

            <div className="p-6 md:p-8">
              <CreateClassForm students={students || []} teacherId={user.id} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
