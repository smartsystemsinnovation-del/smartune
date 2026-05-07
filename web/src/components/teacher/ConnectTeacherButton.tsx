'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ConnectTeacherButton({ teacherId }: { teacherId: string }) {
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
      disabled={loading}
      style={{
        padding: '16px 32px',
        background: 'var(--neon-pink)',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        fontWeight: 600,
        fontSize: '16px',
        cursor: loading ? 'not-allowed' : 'pointer',
        boxShadow: '0 8px 30px rgba(255, 0, 122, 0.4)',
        transition: 'all 0.3s'
      }}
    >
      {loading ? 'Conectando...' : 'Elegir y Conectar con este Profesor'}
    </button>
  );
}
