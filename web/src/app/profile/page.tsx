'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User, Mail, Link as LinkIcon, Music, Save, X } from 'lucide-react';
import Navigation from '@/components/Navigation';
import styles from './page.module.css';

const ALL_GENRES = [
  "Hardstyle", "Phonk", "Rock", "Pop", "Electrónica", 
  "Videojuegos", "Metal", "Trap", "Lo-fi"
];

const INSTRUMENTS = ['Guitarra', 'Batería', 'Piano', 'Bajo', 'Voz', 'Sintetizador', 'Ninguno', 'Otro'];

export default function ProfilePage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [instrument, setInstrument] = useState('Ninguno');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setEmail(user.email || '');
          
          // Intentar cargar desde la base de datos primero (API)
          const res = await fetch('/api/user/profile');
          if (res.ok) {
            const dbData = await res.json();
            setUsername(dbData.nombre || user.user_metadata?.full_name || '');
            setAvatarUrl(dbData.avatar_url || user.user_metadata?.avatar_url || '');
            setInstrument(dbData.instrumento || user.user_metadata?.instrument || 'Ninguno');
            setSelectedGenres(dbData.gustos_musicales || user.user_metadata?.favorite_genres || []);
          } else {
            // Fallback a metadata si falla la API
            setUsername(user.user_metadata?.full_name || '');
            setAvatarUrl(user.user_metadata?.avatar_url || '');
            setSelectedGenres(user.user_metadata?.favorite_genres || []);
            setInstrument(user.user_metadata?.instrument || 'Ninguno');
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [supabase]);

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre) 
        : [...prev, genre]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      // 1. Update Auth Metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: username,
          avatar_url: avatarUrl,
          favorite_genres: selectedGenres,
          instrument: instrument
        }
      });

      if (authError) throw authError;

      // 2. Also update via API if exists (to keep sync with profiles table if used)
      await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: username,
          avatar_url: avatarUrl,
          instrumento: instrument,
          gustos_musicales: selectedGenres
        })
      });
      
      setMessage({ type: 'success', text: '¡Perfil actualizado correctamente!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Error al actualizar el perfil' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className={styles.main} style={{ justifyContent: 'flex-start' }}>
        <Navigation />
        <div className={styles.contentWrapper}>
          <div className={styles.card}>
            <p className={styles.sectionLabel}>Cargando Perfil...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main} style={{ justifyContent: 'flex-start' }}>
      <Navigation />
      
      <div className={styles.contentWrapper}>
        {/* Background Glows (Figma Style) */}
        <div className={styles.overlayBlur1} />
        <div className={styles.overlayBlur2} />

        <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.avatarContainer}>
            <div className={styles.avatarGlow} />
            <div className={styles.avatar}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className={styles.avatarImage} />
              ) : (
                <User size={40} color="#6b7280" />
              )}
            </div>
          </div>
          <h1 className={styles.title}>Ajustes</h1>
        </div>

        <form onSubmit={handleSave} className={styles.form}>
          {message && (
            <div className={message.type === 'success' ? styles.successMsg : styles.errorMsg}>
              {message.text}
            </div>
          )}

          <div className={styles.inputWrapper}>
            <User className={styles.inputIcon} size={18} />
            <input 
              type="text" 
              placeholder="Username" 
              className={styles.input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputWrapper}>
            <Mail className={styles.inputIcon} size={18} />
            <input 
              type="email" 
              placeholder="Correo Electrónico" 
              className={styles.input}
              value={email}
              disabled
            />
          </div>

          <div className={styles.inputWrapper}>
            <LinkIcon className={styles.inputIcon} size={18} />
            <input 
              type="text" 
              placeholder="Avatar URL" 
              className={styles.input}
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
            />
          </div>

          <div className={styles.inputWrapper}>
            <Music className={styles.inputIcon} size={18} />
            <select 
              className={styles.input}
              value={instrument}
              onChange={(e) => setInstrument(e.target.value)}
            >
              {INSTRUMENTS.map(i => (
                <option key={i} value={i} style={{ background: '#1A1A1A' }}>{i}</option>
              ))}
            </select>
          </div>

          <div>
            <p className={styles.sectionLabel}>Géneros Favoritos</p>
            <div className={styles.genresGrid}>
              {ALL_GENRES.map(genre => (
                <div 
                  key={genre}
                  onClick={() => toggleGenre(genre)}
                  className={`${styles.genreChip} ${selectedGenres.includes(genre) ? styles.genreChipActive : ''}`}
                >
                  {genre}
                </div>
              ))}
            </div>
          </div>

          <div className={styles.actions}>
            <button type="submit" className={styles.saveBtn} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            <button 
              type="button" 
              className={styles.cancelBtn}
              onClick={() => window.history.back()}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  </main>
  );
}
