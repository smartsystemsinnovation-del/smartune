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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,rgba(246,51,154,0.05),transparent),radial-gradient(circle_at_bottom_left,rgba(152,16,250,0.05),transparent)]">
      <div className="w-full max-w-xl bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 p-8 md:p-12">
        
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-[#f6339a] to-[#9810fa] rounded-xl flex items-center justify-center shadow-lg transform -rotate-6">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            </div>
            <span className="text-2xl font-black text-gray-900 tracking-tighter">SmarTune</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">¡Hola! Bienvenido</h1>
          <p className="text-gray-500 font-medium">Cuéntanos un poco sobre ti para personalizar tu experiencia.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* User Name */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">¿Cómo te llamas?</label>
            <input
              type="text"
              required
              className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#f6339a]/20 focus:border-[#f6339a] outline-none transition-all text-gray-900 font-medium placeholder:text-gray-300"
              placeholder="Ej. Alex Smith"
              value={formData.nombre}
              onChange={e => setFormData({ ...formData, nombre: e.target.value })}
            />
          </div>

          {/* Avatar URL */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Foto de perfil (URL)</label>
            <input
              type="url"
              className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#f6339a]/20 focus:border-[#f6339a] outline-none transition-all text-gray-900 font-medium placeholder:text-gray-300"
              placeholder="https://ejemplo.com/mifoto.jpg"
              value={formData.avatar_url}
              onChange={e => setFormData({ ...formData, avatar_url: e.target.value })}
            />
          </div>

          {/* Instrument */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">¿Qué instrumento tocas?</label>
            <select
              className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#f6339a]/20 focus:border-[#f6339a] outline-none transition-all text-gray-900 font-medium appearance-none cursor-pointer"
              value={formData.instrumento}
              onChange={e => setFormData({ ...formData, instrumento: e.target.value })}
            >
              {INSTRUMENTS.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>

          {/* Tastes */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3 ml-1">Tus gustos musicales</label>
            <div className="flex flex-wrap gap-2">
              {TASTES.map(taste => (
                <button
                  key={taste}
                  type="button"
                  onClick={() => handleTasteToggle(taste)}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all border ${
                    formData.gustos_musicales.includes(taste)
                      ? 'bg-[#f6339a] border-[#f6339a] text-white shadow-lg shadow-[#f6339a]/20'
                      : 'bg-white border-gray-100 text-gray-500 hover:border-gray-300'
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
            disabled={loading}
            className="w-full py-5 bg-gray-900 text-white rounded-[1.5rem] font-bold text-lg shadow-xl shadow-gray-200 hover:bg-black transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Comenzar mi viaje musical →'}
          </button>
        </form>
      </div>
    </div>
  );
}
