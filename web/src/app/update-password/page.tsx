'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import styles from './page.module.css';

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [verifying, setVerifying] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const checkSession = async () => {
      // 1. Verificar si hay un código PKCE en la URL
      const query = new URLSearchParams(window.location.search);
      const code = query.get('code');

      if (code) {
        // Intercambiar el código por una sesión
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error('Error exchanging code:', error.message);
          setErrorMsg('El enlace de recuperación ha expirado o no es válido.');
        }
      } else {
        // Si no hay código, verificar si ya tenemos una sesión activa (por hash o cookie)
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setErrorMsg('No se encontró una sesión activa. Por favor, solicita un nuevo enlace de recuperación.');
        }
      }
      setVerifying(false);
    };
    checkSession();
  }, [supabase]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;
      
      // Contraseña actualizada con éxito
      router.push('/dashboard');
      router.refresh();
    } catch (error: any) {
      setErrorMsg(error.message || 'Hubo un error al actualizar la contraseña');
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <p className={styles.subtitle}>Verificando enlace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Nueva <span>Contraseña</span></h1>
        <p className={styles.subtitle}>Escribe tu nueva clave de acceso para Smartune.</p>
        
        <form onSubmit={handleUpdatePassword} className={styles.form}>
          {errorMsg && (
            <div className={styles.error} style={{ 
              background: 'rgba(255, 0, 0, 0.1)', 
              border: '1px solid #ff4d4d', 
              color: '#ff4d4d',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
              textAlign: 'center',
              fontSize: '14px'
            }}>
              {errorMsg}
            </div>
          )}
          
          <div className={styles.inputGroup}>
            <label>Contraseña Nueva</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Actualizando...' : 'Cambiar Contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}
