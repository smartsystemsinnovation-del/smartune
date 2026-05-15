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
    <div className="min-h-screen bg-[#06060f] text-white font-sans flex">
      <div className="hidden md:block flex-shrink-0" style={{ width: '270px' }} />

      <div className="flex-1 relative overflow-hidden">

        {/* ── Ambient glow con colores de Google Meet ── */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-5%] left-[15%] w-[500px] h-[500px] rounded-full blur-[160px] opacity-[0.22]"
            style={{ background: 'radial-gradient(circle, #4285F4, transparent 70%)' }} />
          <div className="absolute top-[20%] right-[5%] w-[400px] h-[400px] rounded-full blur-[150px] opacity-[0.18]"
            style={{ background: 'radial-gradient(circle, #34A853, transparent 70%)' }} />
          <div className="absolute bottom-[10%] left-[5%] w-[350px] h-[350px] rounded-full blur-[150px] opacity-[0.16]"
            style={{ background: 'radial-gradient(circle, #EA4335, transparent 70%)' }} />
          <div className="absolute bottom-[-5%] right-[20%] w-[400px] h-[400px] rounded-full blur-[160px] opacity-[0.15]"
            style={{ background: 'radial-gradient(circle, #FBBC05, transparent 70%)' }} />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-start min-h-screen px-6 pt-20 pb-20">
          <div className="w-full max-w-[640px]">

            {/* Back */}
            <Link href="/teacher/clases">
              <span className="inline-flex items-center gap-1.5 text-white/30 hover:text-white/60 transition-colors text-xs mb-10 cursor-pointer select-none">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                SmartRoom
              </span>
            </Link>

            {/* ── Hero ── */}
            <div className="flex items-start gap-5 mb-10">
              {/* Meet Logo grande */}
              <div className="flex-shrink-0 mt-1">
                <svg viewBox="0 0 72 72" width={52} height={52} fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="52" height="52" x="2" y="10" rx="10" fill="#EA4335"/>
                  <rect width="26" height="26" x="2" y="10" fill="#EA4335"/>
                  <rect width="26" height="26" x="28" y="10" fill="#FBBC05"/>
                  <rect width="26" height="26" x="2" y="36" fill="#4285F4"/>
                  <rect width="26" height="26" x="28" y="36" fill="#34A853"/>
                  <rect x="16" y="22" width="24" height="26" rx="3" fill="white"/>
                  <path d="M54 26 L70 18 L70 54 L54 46 Z" fill="#34A853" rx="4"/>
                  <rect x="2" y="10" width="52" height="52" rx="10" fill="black" opacity="0.04"/>
                </svg>
              </div>
              <div>
                <p className="text-[11px] text-white/30 uppercase tracking-[0.2em] font-semibold mb-1">Google Meet</p>
                <h1 className="text-3xl font-extrabold text-white tracking-tight">Nueva Sesión</h1>
                <p className="text-white/40 text-sm mt-1.5 leading-relaxed">
                  Agenda una clase y SmarTune genera el enlace automáticamente.
                </p>
              </div>
            </div>

            {/* ── Form Card ── */}
            <div className="rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                boxShadow: '0 0 80px rgba(66,133,244,0.06), 0 0 40px rgba(52,168,83,0.04)',
              }}>
              {/* Top color bar */}
              <div className="flex h-[3px] w-full">
                <div className="flex-1" style={{ background: '#EA4335' }} />
                <div className="flex-1" style={{ background: '#FBBC05' }} />
                <div className="flex-1" style={{ background: '#4285F4' }} />
                <div className="flex-1" style={{ background: '#34A853' }} />
              </div>

              <div className="p-8 md:p-10">
                <CreateClassForm students={students || []} teacherId={user.id} />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
