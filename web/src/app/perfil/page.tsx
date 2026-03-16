'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User, Mail, Link as LinkIcon, Check } from 'lucide-react';
import Navigation from '@/components/Navigation';
import styles from './page.module.css';

const ALL_GENRES = [
  "Hardstyle", "Phonk", "Rock", "Pop", "Electrónica", 
  "Videojuegos", "Metal", "Trap", "Lo-fi"
];

export default function PerfilPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || '');
        setUsername(user.user_metadata?.full_name || '');
        setAvatarUrl(user.user_metadata?.avatar_url || '');
        // Supabase stores user_metadata as a JSON object, we'll store genres there too
        setSelectedGenres(user.user_metadata?.favorite_genres || []);
      }
      setLoading(false);
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
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: username,
          avatar_url: avatarUrl,
          favorite_genres: selectedGenres
        }
      });

      if (error) throw error;
      
      setMessage({ type: 'success', text: '¡Perfil actualizado correctamente!' });
      // Refresh to ensure metadata is updated everywhere
      setTimeout(() => window.location.reload(), 1500);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Error al actualizar el perfil' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className={styles.main}>
        <div className={styles.card}>
          <p className={styles.sectionLabel}>Cargando Perfil...</p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <Navigation />
      
      {/* Background Glows */}
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
    </main>
  );
}
