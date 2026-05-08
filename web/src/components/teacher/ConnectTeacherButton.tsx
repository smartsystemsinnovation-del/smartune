'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ConnectTeacherButton({ 
  teacherId, 
  studentId, 
  hasConnection 
}: { 
  teacherId: string;
  studentId?: string;
  hasConnection?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleConnect = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/connect-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherId })
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert('Hubo un error al intentar conectarse.');
      }
    } catch (error) {
      console.error(error);
      alert('Error de red al intentar conectarse.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleConnect}
      disabled={loading || hasConnection}
      style={{
        padding: '16px 32px',
        background: hasConnection ? 'rgba(255,255,255,0.05)' : 'var(--neon-pink)',
        color: hasConnection ? 'rgba(255,255,255,0.3)' : 'white',
        border: 'none',
        borderRadius: '12px',
        fontWeight: 600,
        fontSize: '16px',
        cursor: (loading || hasConnection) ? 'not-allowed' : 'pointer',
        boxShadow: hasConnection ? 'none' : '0 8px 30px rgba(255, 0, 122, 0.4)',
        transition: 'all 0.3s'
      }}
    >
      {loading ? 'Conectando...' : (hasConnection ? '✓ Profesor Conectado' : 'Elegir y Conectar con este Profesor')}
    </button>
  );
}
