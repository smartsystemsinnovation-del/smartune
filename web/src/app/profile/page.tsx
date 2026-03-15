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
        const data = await res.json();
        if (data) {
          setFormData({
            nombre: data.nombre || '',
            avatar_url: data.avatar_url || '',
            instrumento: data.instrumento || 'Ninguno',
            gustos_musicales: data.gustos_musicales || []
          });
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
      <div className="flex flex-col min-h-screen">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f6339a]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#121212]">
      <Navigation />
      
      <main className="flex-1 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,rgba(246,51,154,0.03),transparent),radial-gradient(circle_at_bottom_left,rgba(152,16,250,0.03),transparent)]">
        <div className="w-full max-w-xl bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-8 md:p-12 relative overflow-hidden">
          {/* Subtle accent border */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#f6339a] to-[#9810fa]"></div>
          
          <div className="text-center mb-10 text-gray-900">
            <h1 className="text-3xl font-black mb-2">Mi Perfil</h1>
            <p className="text-gray-500 font-medium">Personaliza tu identidad en SmarTune</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Preview */}
            <div className="flex justify-center mb-8">
              <div className="w-24 h-24 rounded-full border-4 border-gray-50 overflow-hidden shadow-inner bg-gray-100 flex items-center justify-center">
                {formData.avatar_url ? (
                  <img src={formData.avatar_url} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="gray" strokeWidth="1.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                )}
              </div>
            </div>

            {/* User Name */}
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Nombre Público</label>
              <input
                type="text"
                required
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#f6339a]/20 focus:border-[#f6339a] outline-none transition-all text-gray-900 font-bold"
                value={formData.nombre}
                onChange={e => setFormData({ ...formData, nombre: e.target.value })}
              />
            </div>

            {/* Avatar URL */}
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">URL de Foto</label>
              <input
                type="url"
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#f6339a]/20 focus:border-[#f6339a] outline-none transition-all text-gray-900 font-bold"
                value={formData.avatar_url}
                onChange={e => setFormData({ ...formData, avatar_url: e.target.value })}
              />
            </div>

            {/* Instrument */}
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Tu Instrumento</label>
              <select
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#f6339a]/20 focus:border-[#f6339a] outline-none transition-all text-gray-900 font-bold appearance-none cursor-pointer"
                value={formData.instrumento}
                onChange={e => setFormData({ ...formData, instrumento: e.target.value })}
              >
                {INSTRUMENTS.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>

            {/* Tastes */}
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Tus Preferencias</label>
              <div className="flex flex-wrap gap-2">
                {TASTES.map(taste => (
                  <button
                    key={taste}
                    type="button"
                    onClick={() => handleTasteToggle(taste)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                      formData.gustos_musicales.includes(taste)
                        ? 'bg-[#f6339a] border-[#f6339a] text-white shadow-lg shadow-[#f6339a]/20'
                        : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'
                    }`}
                  >
                    {taste}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={saving}
              className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-lg transition-all active:scale-[0.98] disabled:opacity-50 mt-4 hove:shadow-2xl"
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>

            <Link href="/favoritos" className="block text-center text-sm font-bold text-gray-400 hover:text-[#f6339a] transition-all">
              ← Volver a MusicSwipe
            </Link>
          </form>
        </div>
      </main>
    </div>
  );
}
