'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User, Mail, Link as LinkIcon, Music, Save, X } from 'lucide-react';
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
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [uploading, setUploading] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setEmail(user.email || '');
          
          // Detectar si es usuario de Google
          const isGoogle = user.app_metadata.provider === 'google' || 
                           user.identities?.some((id: any) => id.provider === 'google');
          setIsGoogleUser(!!isGoogle);

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // 0. Verificar límite de 5 días
      const lastUpload = user.user_metadata?.last_avatar_upload;
      if (lastUpload) {
        const lastDate = new Date(lastUpload);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - lastDate.getTime());
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        
        if (diffDays < 5) {
          const remaining = Math.ceil(5 - diffDays);
          throw new Error(`Por seguridad y espacio, solo puedes subir una foto cada 5 días. Faltan ${remaining} día(s).`);
        }
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // 1. Subir a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      
      // 3. Actualizar metadatos inmediatamente con el timestamp de subida
      await supabase.auth.updateUser({
        data: { last_avatar_upload: new Date().toISOString() }
      });

      setMessage({ type: 'success', text: '¡Imagen cargada! No olvides guardar los cambios para actualizar tu perfil.' });
    } catch (error: any) {
      console.error(error);
      setMessage({ type: 'error', text: error.message || 'Error al subir la imagen.' });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      // 1. Update Auth Metadata
      const updateData: any = {
        avatar_url: avatarUrl,
        favorite_genres: selectedGenres,
        instrument: instrument
      };

      // Solo permitir cambiar nombre si NO es usuario de Google
      if (!isGoogleUser) {
        updateData.full_name = username;
      }

      const { error: authError } = await supabase.auth.updateUser({
        data: updateData
      });

      if (authError) throw authError;

      // 2. Also update via API
      await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: isGoogleUser ? undefined : username, // Evitar sobreescribir si es Google
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
            
      <div className={styles.contentWrapper}>
        {/* Background Glows (Figma Style) */}
        <div className={styles.overlayBlur1} />
        <div className={styles.overlayBlur2} />

        <div className={styles.card}>
          <div className={styles.header}>
            <div className={styles.avatarContainer} onClick={() => document.getElementById('avatar-upload')?.click()}>
              <div className={styles.avatarGlow} />
              <div className={styles.avatar}>
                {uploading ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                ) : avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className={styles.avatarImage} />
                ) : (
                  <User size={40} color="#6b7280" />
                )}
              </div>
              <div className={styles.avatarUploadOverlay}>
                <span>{uploading ? '...' : 'SUBIR'}</span>
              </div>
              <input 
                id="avatar-upload"
                type="file" 
                accept="image/*"
                className={styles.hiddenInput}
                onChange={handleImageUpload}
                disabled={uploading}
              />
            </div>
            <h1 className={styles.title}>Ajustes</h1>
            {isGoogleUser && (
              <p className="text-[10px] text-gray-500 uppercase tracking-tighter">Cuenta de Google vinculada</p>
            )}
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
                disabled={isGoogleUser}
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
