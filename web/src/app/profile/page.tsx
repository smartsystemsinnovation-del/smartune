"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import Navigation from '@/components/Navigation';
import Link from 'next/link';

const INSTRUMENTS = ['Guitarra', 'Batería', 'Piano', 'Bajo', 'Voz', 'Sintetizador', 'Ninguno', 'Otro'];
const TASTES = ['Hardstyle', 'Phonk', 'Rock', 'Pop', 'Electrónica', 'Videojuegos', 'Metal', 'Trap', 'Lo-fi'];

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    avatar_url: '',
    instrumento: 'Ninguno',
    gustos_musicales: [] as string[]
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/');
        return;
      }

      try {
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setFormData({
              nombre: data.nombre || '',
              avatar_url: data.avatar_url || '',
              instrumento: data.instrumento || 'Ninguno',
              gustos_musicales: data.gustos_musicales || []
            });
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router, supabase]);

  const handleTasteToggle = (taste: string) => {
    setFormData(prev => ({
      ...prev,
      gustos_musicales: prev.gustos_musicales.includes(taste)
        ? prev.gustos_musicales.filter(t => t !== taste)
        : [...prev.gustos_musicales, taste]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        alert("¡Perfil actualizado con éxito!");
      } else {
        alert("Error al guardar el perfil");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#0F0F0F]">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D000FF]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0F0F0F] text-white font-inter selection:bg-[#D000FF]/30">
      <Navigation />
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Figma Aesthetic Background */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20 pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#D000FF]/5 rounded-full blur-[150px]"></div>

        <div className="w-full max-w-lg bg-[#1A1A1A] rounded-[2.5rem] border border-white/5 p-8 md:p-14 relative z-10 shadow-[0_0_80px_rgba(0,0,0,0.8)]">
          
          {/* Glowing Profile Avatar (Figma Style) */}
          <div className="flex justify-center mb-10">
            <div className="relative group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-[#D000FF] to-[#8000FF] rounded-full blur-2xl opacity-40 group-hover:opacity-70 transition-opacity"></div>
              <div className="relative w-32 h-32 rounded-full border-4 border-white/10 bg-[#222] flex items-center justify-center overflow-hidden shadow-2xl">
                {formData.avatar_url ? (
                  <img src={formData.avatar_url} alt="Profile" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                ) : (
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                )}
                {/* Edit Overlay */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <svg width="24" height="24" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                     <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                   </svg>
                </div>
              </div>
            </div>
          </div>

          <h1 className="text-xl font-black tracking-[0.3em] uppercase mb-14 text-center text-white/90">Ajustes</h1>

          <form onSubmit={handleSubmit} className="w-full space-y-12">
            {/* Underlined Inputs */}
            <div className="space-y-10">
              {/* Name */}
              <div className="relative group">
                <div className="absolute left-0 bottom-4 text-white/40 group-focus-within:text-[#D000FF] transition-colors">
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-4 bg-transparent border-b border-white/10 focus:border-[#D000FF] outline-none transition-all text-white font-medium text-lg"
                  value={formData.nombre}
                  placeholder="Username"
                  onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                />
              </div>

              {/* Avatar URL */}
              <div className="relative group">
                <div className="absolute left-0 bottom-4 text-white/40 group-focus-within:text-[#D000FF] transition-colors">
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="url"
                  className="w-full pl-10 pr-4 py-4 bg-transparent border-b border-white/10 focus:border-[#D000FF] outline-none transition-all text-white font-medium text-lg"
                  value={formData.avatar_url}
                  placeholder="Avatar URL"
                  onChange={e => setFormData({ ...formData, avatar_url: e.target.value })}
                />
              </div>

              {/* Instrument */}
              <div className="relative group">
                <div className="absolute left-0 bottom-4 text-white/40 group-focus-within:text-[#D000FF] transition-colors">
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <select
                  className="w-full pl-10 pr-4 py-4 bg-transparent border-b border-white/10 focus:border-[#D000FF] outline-none transition-all text-white font-medium text-lg appearance-none cursor-pointer"
                  value={formData.instrumento}
                  onChange={e => setFormData({ ...formData, instrumento: e.target.value })}
                >
                  {INSTRUMENTS.map(i => <option key={i} value={i} className="bg-[#1A1A1A]">{i}</option>)}
                </select>
              </div>
            </div>

            {/* Preferences */}
            <div className="space-y-4">
              <p className="text-[11px] font-black tracking-[0.2em] text-white/30 uppercase text-center">Géneros Favoritos</p>
              <div className="flex flex-wrap justify-center gap-2">
                {TASTES.map(taste => {
                  const isSelected = formData.gustos_musicales.includes(taste);
                  return (
                    <button
                      key={taste}
                      type="button"
                      onClick={() => handleTasteToggle(taste)}
                      className={`px-4 py-1.5 rounded-full text-[11px] font-bold transition-all border ${
                        isSelected
                          ? 'bg-[#D000FF] border-[#D000FF] text-white shadow-[0_0_15px_rgba(208,0,255,0.4)]'
                          : 'bg-transparent border-white/10 text-white/40 hover:border-white/30'
                      }`}
                    >
                      {taste}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Figma Style Actions */}
            <div className="space-y-6 pt-10">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-5 bg-gradient-to-r from-[#D000FF] to-[#8000FF] text-white font-black text-lg tracking-widest uppercase rounded-2xl shadow-[0_10px_30px_rgba(208,0,255,0.3)] hover:shadow-[0_15px_40px_rgba(208,0,255,0.5)] transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
              <Link
                href="/favoritos"
                className="block w-full py-5 text-center text-white/60 font-black text-lg tracking-widest uppercase hover:text-white transition-colors"
              >
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
