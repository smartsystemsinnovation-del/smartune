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
      <div className="flex flex-col min-h-screen bg-[#0a0a0a]">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f6339a]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a] text-white font-inter">
      <Navigation />
      
      <main className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-1/4 right-0 w-64 h-64 bg-[#f6339a]/5 rounded-full blur-[80px]"></div>
        <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-[#9810fa]/5 rounded-full blur-[80px]"></div>

        <div className="w-full max-w-2xl bg-white/[0.03] backdrop-blur-2xl rounded-[3rem] border border-white/10 p-8 md:p-12 relative z-10 shadow-2xl">
          {/* Neon line at top */}
          <div className="absolute top-0 left-12 right-12 h-[2px] bg-gradient-to-r from-transparent via-[#f6339a] to-transparent"></div>
          
          <div className="text-center mb-12">
            <h1 className="text-4xl font-black mb-3 tracking-tight">Configuration</h1>
            <p className="text-gray-400 font-medium">Gestiona tu identidad musical en el ecosistema SmarTune</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Avatar Preview & URL */}
            <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
              <div className="relative group">
                <div className="w-32 h-32 rounded-[2rem] bg-black/40 border-2 border-white/10 overflow-hidden shadow-2xl transition-all group-hover:border-[#f6339a]/50">
                  {formData.avatar_url ? (
                    <img src={formData.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#f6339a] rounded-xl flex items-center justify-center shadow-lg border border-black/20">
                   <svg width="20" height="20" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                     <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                   </svg>
                </div>
              </div>
              
              <div className="flex-1 w-full relative">
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3 ml-1">URL de la Imagen</label>
                <input
                  type="url"
                  className="w-full px-6 py-4 bg-black/40 border border-white/5 rounded-2xl focus:ring-1 focus:ring-[#f6339a] outline-none transition-all text-sm font-bold placeholder:text-gray-700"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.avatar_url}
                  onChange={e => setFormData({ ...formData, avatar_url: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* User Name */}
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3 ml-1">Tu Nombre</label>
                <input
                  type="text"
                  required
                  className="w-full px-6 py-4 bg-black/40 border border-white/5 rounded-2xl focus:ring-1 focus:ring-[#f6339a] outline-none transition-all font-bold"
                  value={formData.nombre}
                  onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                />
              </div>

              {/* Instrument */}
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3 ml-1">Instrumento</label>
                <select
                  className="w-full px-6 py-4 bg-black/40 border border-white/5 rounded-2xl focus:ring-1 focus:ring-[#f6339a] outline-none transition-all font-bold appearance-none cursor-pointer"
                  value={formData.instrumento}
                  onChange={e => setFormData({ ...formData, instrumento: e.target.value })}
                >
                  {INSTRUMENTS.map(i => <option key={i} value={i} className="bg-[#1a1a1a]">{i}</option>)}
                </select>
              </div>
            </div>

            {/* Tastes */}
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-5 ml-1">Preferencias Musicales</label>
              <div className="flex flex-wrap gap-2">
                {TASTES.map(taste => {
                  const isSelected = formData.gustos_musicales.includes(taste);
                  return (
                    <button
                      key={taste}
                      type="button"
                      onClick={() => handleTasteToggle(taste)}
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                        isSelected
                          ? 'bg-[#f6339a] border-[#f6339a] text-white shadow-lg shadow-[#f6339a]/20'
                          : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/20'
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
                disabled={saving}
                className="w-full py-5 bg-gradient-to-r from-[#f6339a] to-[#9810fa] text-white rounded-2xl font-black text-lg shadow-xl hover:shadow-[0_0_20px_rgba(246,51,154,0.4)] transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'GUARDAR CAMBIOS'}
              </button>
            </div>

            <Link href="/favoritos" className="block text-center text-sm font-bold text-gray-500 hover:text-white transition-all uppercase tracking-widest pt-4">
              ← REGRESAR A MUSIC SWIPE
            </Link>
          </form>
        </div>
      </main>
    </div>
  );
}
