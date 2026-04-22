'use client';

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import AuthModal from "@/components/AuthModal";
import styles from "./page.module.css";
import { getLandingStats, getLandingReleases } from "@/lib/api/landing";

import HeroSection from "@/components/landing/HeroSection";
import TopInstrumentosSection from "@/components/landing/TopInstrumentosSection";
import ReleasesSection from "@/components/landing/ReleasesSection";
import CtaSection from "@/components/landing/CtaSection";
import FooterSection from "@/components/landing/FooterSection";

function HomeContent() {
  const searchParams = useSearchParams();
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'login'|'register'>('login');
  const [user, setUser] = useState<any>(null);
  
  const [stats, setStats] = useState<{topInstrumentos: {name: string, count: number}[], topEnsenanzas: {name: string, count: number}[]}>({ topInstrumentos: [], topEnsenanzas: [] });
  const [releases, setReleases] = useState<any[]>([]);

  const supabase = createClient();

  useEffect(() => {
    // Fetch stats and new releases independently using isolated API file
    getLandingStats().then(setStats).catch(console.error);
    getLandingReleases().then(setReleases).catch(console.error);

    let currentUser: any = null;

    const checkUserAndParams = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      currentUser = session?.user;

      if (!currentUser && searchParams.get('login') === 'true') {
        const timer = setTimeout(() => {
          setModalMode('login');
          setShowModal(true);
        }, 500);
        
        return () => clearTimeout(timer);
      }
    };
    checkUserAndParams();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: unknown, session: { user: any } | null) => {
        setUser(session?.user || null);
        if (session?.user) {
          setShowModal(false);
        }
      }
    );
    return () => subscription.unsubscribe();
  }, [searchParams, supabase]);

  const openAuth = (mode: 'login'|'register') => {
    setModalMode(mode);
    setShowModal(true);
  };

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
        scopes: 'https://www.googleapis.com/auth/calendar.events'
      }
    });
  };

  return (
    <main className={styles.main}>
      {showModal && (
        <AuthModal 
          initialMode={modalMode} 
          onClose={() => setShowModal(false)} 
        />
      )}

      {/* HERO SECTION */}
      <HeroSection user={user} openAuth={openAuth} />

      {/* TOP INSTRUMENTOS SECTION */}
      <TopInstrumentosSection stats={stats} />

      {/* NUEVOS LANZAMIENTOS SECTION */}
      <ReleasesSection releases={releases} />

      {/* UNETE A NUESTRO EQUIPO (CTA) - SOLO PARA GUESTS */}
      {!user && (
        <CtaSection openAuth={openAuth} signInWithGoogle={signInWithGoogle} />
      )}

      {/* FOOTER (NOSOTROS) */}
      <FooterSection />
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#181818' }} />}>
      <HomeContent />
    </Suspense>
  );
}
