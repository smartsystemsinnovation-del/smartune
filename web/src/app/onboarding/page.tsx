"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

const INSTRUMENTS = ['Guitarra', 'Batería', 'Piano', 'Bajo', 'Voz', 'Sintetizador', 'Ninguno', 'Otro'];
const TASTES = ['Hardstyle', 'Phonk', 'Rock', 'Pop', 'Electrónica', 'Videojuegos', 'Metal', 'Trap', 'Lo-fi'];

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    avatar_url: '',
    instrumento: 'Ninguno',
    gustos_musicales: [] as string[]
  });

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/');
      }
    };
    checkSession();
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
    setLoading(true);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        router.push('/favoritos');
      } else {
        alert("Error al guardar el perfil");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 md:p-8 relative overflow-hidden font-inter">
      {/* Animated Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#f6339a]/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#9810fa]/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-2xl bg-white/5 backdrop-blur-[32px] rounded-[3rem] border border-white/10 p-8 md:p-14 relative z-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">
        
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#f6339a] to-[#9810fa] rounded-2xl mb-6 shadow-[0_0_30px_rgba(246,51,154,0.3)] transform -rotate-3 transition-transform hover:rotate-0">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter">
            Configura tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f6339a] to-[#9810fa]">Vibe</span>
          </h1>
          <p className="text-gray-400 font-medium text-lg">Personaliza tu experiencia musical en <span className="text-white font-bold">SmarTune</span></p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* User Name */}
            <div className="relative group">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1 group-focus-within:text-[#f6339a] transition-colors">Tu Nombre</label>
              <input
                type="text"
                required
                className="w-full px-6 py-5 bg-black/40 border border-white/5 rounded-[1.5rem] focus:ring-2 focus:ring-[#f6339a]/30 focus:border-[#f6339a] outline-none transition-all text-white font-bold placeholder:text-gray-600"
                placeholder="Ej. Alex Smith"
                value={formData.nombre}
                onChange={e => setFormData({ ...formData, nombre: e.target.value })}
              />
            </div>

            {/* Instrument */}
            <div className="relative group">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1 group-focus-within:text-[#9810fa] transition-colors">Instrumento</label>
              <div className="relative">
                <select
                  className="w-full px-6 py-5 bg-black/40 border border-white/5 rounded-[1.5rem] focus:ring-2 focus:ring-[#9810fa]/30 focus:border-[#9810fa] outline-none transition-all text-white font-bold appearance-none cursor-pointer"
                  value={formData.instrumento}
                  onChange={e => setFormData({ ...formData, instrumento: e.target.value })}
                >
                  {INSTRUMENTS.map(i => <option key={i} value={i} className="bg-[#1a1a1a]">{i}</option>)}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Avatar URL */}
          <div className="relative group">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1 group-focus-within:text-[#f6339a] transition-colors">Foto de Perfil (URL)</label>
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <input
                  type="url"
                  className="w-full px-6 py-5 bg-black/40 border border-white/5 rounded-[1.5rem] focus:ring-2 focus:ring-[#f6339a]/30 focus:border-[#f6339a] outline-none transition-all text-white font-bold placeholder:text-gray-600"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={formData.avatar_url}
                  onChange={e => setFormData({ ...formData, avatar_url: e.target.value })}
                />
              </div>
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex-shrink-0 flex items-center justify-center overflow-hidden">
                {formData.avatar_url ? (
                  <img src={formData.avatar_url} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <svg width="24" height="24" fill="none" stroke="#333" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
            </div>
          </div>

          {/* Tastes */}
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-5 ml-1">Tus Géneros Favoritos</label>
            <div className="flex flex-wrap gap-3">
              {TASTES.map(taste => {
                const isSelected = formData.gustos_musicales.includes(taste);
                return (
                  <button
                    key={taste}
                    type="button"
                    onClick={() => handleTasteToggle(taste)}
                    className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all border ${
                      isSelected
                        ? 'bg-[#f6339a] border-[#f6339a] text-white shadow-[0_0_20px_rgba(246,51,154,0.4)] scale-105'
                        : 'bg-white/5 border-white/5 text-gray-400 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {taste}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-6 bg-gradient-to-r from-[#f6339a] to-[#9810fa] text-white rounded-[2rem] font-black text-xl shadow-[0_15px_30px_rgba(246,51,154,0.3)] hover:shadow-[0_20px_40px_rgba(246,51,154,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 group"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : (
                <>
                  EXPLORAR SMARTUNE
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" className="group-hover:translate-x-1 transition-transform">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
