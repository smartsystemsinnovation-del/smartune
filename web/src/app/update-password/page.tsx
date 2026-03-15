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
  const [sessionChecked, setSessionChecked] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    // Verificar si el usuario realmente aterrizó aquí con una sesión de recuperación válida
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Podría ser redirigido aquí o tal vez el #hash token no se procesó bien
        // pero le daremos el beneficio de la duda y permitiremos intentar setear
      }
      setSessionChecked(true);
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

  if (!sessionChecked) return null;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Nueva <span>Contraseña</span></h1>
        <p className={styles.subtitle}>Escribe tu nueva clave de acceso para Smartune.</p>
        
        <form onSubmit={handleUpdatePassword} className={styles.form}>
          {errorMsg && <div className={styles.error}>{errorMsg}</div>}
          
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
