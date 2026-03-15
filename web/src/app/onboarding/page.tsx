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
    <div className="min-h-screen bg-[#3a007d] flex flex-col items-center justify-center p-6 relative overflow-hidden font-inter text-white">
      {/* Background Gradient Mesh */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#4c1d95] via-[#3a007d] to-[#1e1b4b]"></div>
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#9810fa]/20 rounded-full blur-[150px]"></div>
      
      <div className="w-full max-w-md relative z-10 flex flex-col items-center">
        
        {/* Profile Circle Icon (Similar to Reference) */}
        <div className="w-32 h-32 rounded-full border border-white/30 flex items-center justify-center mb-12 bg-white/5 backdrop-blur-sm overflow-hidden group">
          {formData.avatar_url ? (
            <img src={formData.avatar_url} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          )}
        </div>

        <h1 className="text-2xl font-light tracking-[0.3em] uppercase mb-16 text-center opacity-90">SmarTune</h1>

        <form onSubmit={handleSubmit} className="w-full space-y-12">
          {/* User Name */}
          <div className="relative group">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-white transition-colors">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <input
              type="text"
              required
              className="w-full pl-9 pr-4 py-3 bg-transparent border-b border-white/30 focus:border-white outline-none transition-all text-white font-light placeholder:text-white/40"
              placeholder="Username"
              value={formData.nombre}
              onChange={e => setFormData({ ...formData, nombre: e.target.value })}
            />
          </div>

          {/* Avatar URL */}
          <div className="relative group">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-white transition-colors">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <input
              type="url"
              className="w-full pl-9 pr-4 py-3 bg-transparent border-b border-white/30 focus:border-white outline-none transition-all text-white font-light placeholder:text-white/40"
              placeholder="Avatar URL"
              value={formData.avatar_url}
              onChange={e => setFormData({ ...formData, avatar_url: e.target.value })}
            />
          </div>

          {/* Instrument Select (Styled Minimalist) */}
          <div className="relative group">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-white transition-colors">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <select
              className="w-full pl-9 pr-4 py-3 bg-transparent border-b border-white/30 focus:border-white outline-none transition-all text-white font-light appearance-none cursor-pointer"
              value={formData.instrumento}
              onChange={e => setFormData({ ...formData, instrumento: e.target.value })}
            >
              <option disabled value="">Select Instrument</option>
              {INSTRUMENTS.map(i => <option key={i} value={i} className="bg-[#3a007d] text-white">{i}</option>)}
            </select>
          </div>

          {/* Tastes (Mini Tags) */}
          <div className="space-y-4">
            <p className="text-[10px] font-bold tracking-widest text-white/40 uppercase">GÉNEROS FAVORITOS</p>
            <div className="flex flex-wrap gap-2">
              {TASTES.map(taste => {
                const isSelected = formData.gustos_musicales.includes(taste);
                return (
                  <button
                    key={taste}
                    type="button"
                    onClick={() => handleTasteToggle(taste)}
                    className={`px-4 py-1.5 rounded-full text-[11px] font-bold transition-all border ${
                      isSelected
                        ? 'bg-white text-[#3a007d] border-white'
                        : 'bg-transparent border-white/20 text-white/60 hover:border-white/50'
                    }`}
                  >
                    {taste}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Buttons Group (Strictly following Reference Image) */}
          <div className="space-y-4 pt-12">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#8b5cf6] hover:bg-[#a78bfa] text-white font-bold text-sm tracking-widest uppercase rounded-lg shadow-2xl transition-all disabled:opacity-50"
            >
              {loading ? 'LOADING...' : 'CONTINUE'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-bold text-sm tracking-widest uppercase rounded-lg border border-white/10 transition-all"
            >
              CANCEL
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
