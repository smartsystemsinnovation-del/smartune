'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import styles from './AuthModal.module.css';

interface AuthModalProps {
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

import { createClient } from '@/utils/supabase/client';

export default function AuthModal({ onClose, initialMode = 'login' }: AuthModalProps) {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot_password'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Nombres y Correos
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
    // Evitar scroll cuando el modal está abierto
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          // Incluimos scopes para obtener nombre y email, además del calendario y Google Meet
          scopes: 'openid https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/meetings.space.created'
        }
      });
      if (error) throw error;
    } catch (error: any) {
      setErrorMsg(error.message || 'Error conectando con Google');
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) throw error;
      setSuccessMsg('Te hemos enviado un correo con el enlace para recuperar tu contraseña.');
    } catch (error: any) {
      setErrorMsg(error.message || 'Error al solicitar recuperación');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'forgot_password') {
      return handlePasswordReset(e);
    }

    setLoading(true);
    setErrorMsg('');

    try {
      if (mode === 'register') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            }
          }
        });
        if (error) throw error;
        
        // Sometimes Supabase requires Email Confirm if settings say so.
        if (data.user && data.user.identities && data.user.identities.length === 0) {
           setErrorMsg('El registro falló porque este correo ya está en uso. Por favor, inicia sesión.');
           setLoading(false);
           return;
        }

        // Si devuelve sesión inmediata (Sin confirmación de email)
        if (data.session) {
          setLoading(false);
          onClose();
          router.push('/dashboard');
          router.refresh();
          return;
        } else {
          setSuccessMsg('¡Cuenta creada! Por favor comprueba tu correo para verificar.');
          setLoading(false);
          return;
        }

      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        setLoading(false);
        onClose();
        router.push('/dashboard');
        router.refresh(); // Refrescar el layout para aplicar las vistas protegidas
      }

    } catch (error: any) {
      if (error.message?.includes('rate limit')) {
        setErrorMsg('Demasiados intentos. Supabase bloquea múltiples logins o registros. Espera unos minutos.');
      } else {
        setErrorMsg(error.message || 'Error al autenticar');
      }
      setLoading(false);
    }
  };

  const getTitle = () => {
    if (mode === 'forgot_password') return <h2 className={styles.title}>Recupera tu <span>Acceso</span></h2>;
    if (mode === 'login') return <h2 className={styles.title}>Bienvenido de <span>Vuelta</span></h2>;
    return <h2 className={styles.title}>Empieza tu <span>Viaje</span></h2>;
  };

  const modalContent = (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>×</button>
        
        {getTitle()}
        
        {successMsg && <div className={styles.successMessage} style={{ marginBottom: '1rem' }}>{successMsg}</div>}
        
        <form onSubmit={handleSubmit} className={styles.formContainer}>
          {errorMsg && <div className={styles.errorMessage} style={{ color: '#ff4b4b', margin: '0 0 1rem 0', fontSize: '0.9rem', textAlign: 'center' }}>{errorMsg}</div>}
          
          {mode === 'register' && (
            <div className={styles.inputGroup}>
              <label>Nombre</label>
              <input 
                type="text" 
                placeholder="Beethoven" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required 
              />
            </div>
          )}
          
          <div className={styles.inputGroup}>
            <label>Correo Electrónico</label>
            <input 
              type="email" 
              placeholder="ludwig@smartune.app" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          
          {mode !== 'forgot_password' && (
            <div className={styles.inputGroup}>
              <label>Contraseña</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
          )}

          {mode === 'login' && (
             <span className={styles.forgotPassword} onClick={() => setMode('forgot_password')}>
               ¿Olvidaste tu contraseña?
             </span>
          )}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Cargando...' : 
              (mode === 'login' ? 'Inicia Sesión' : 
               mode === 'register' ? 'Regístrate' : 'Enviar verificación')}
          </button>
        </form>

        {mode !== 'forgot_password' && (
          <>
            <div className={styles.divider}>o</div>
            
            <button className={styles.googleBtn} onClick={handleGoogleSignIn} disabled={loading}>
              <div className={styles.googleIconWrapper}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </div>
              <span>Continuar con Google</span>
            </button>
          </>
        )}

        <p className={styles.toggleMode}>
          {mode === 'login' ? '¿No tienes cuenta? ' : 
           mode === 'register' ? '¿Ya tienes cuenta? ' : '¿Recordaste tu contraseña? '}
           
          <span onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login');
            setSuccessMsg('');
            setErrorMsg('');
          }}>
            {mode === 'login' ? 'Regístrate' : 'Inicia Sesión'}
          </span>
        </p>
      </div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(modalContent, document.body);
}
