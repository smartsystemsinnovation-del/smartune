'use client';

import { useState } from 'react';
import { connectWithTeacher } from './actions';
import { CheckCircle, UserPlus, Eye } from 'lucide-react';
import Link from 'next/link';

interface TeacherCardProps {
  teacher: {
    id: string;
    nombre: string;
    correo: string;
    avatar_url?: string;
    instrumento?: string;
  };
  alreadyConnected: boolean;
}

export default function TeacherCard({ teacher, alreadyConnected }: TeacherCardProps) {
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(alreadyConnected);
  const [error, setError] = useState('');

  const handleConnect = async () => {
    setLoading(true);
    setError('');
    const result = await connectWithTeacher(teacher.id);
    
    if (result.error) {
      setError(result.error);
    } else if (result.success) {
      setConnected(true);
    }
    setLoading(false);
  };

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.03)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
    }}
    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--neon-pink)'}
    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: teacher.avatar_url ? `url(${teacher.avatar_url}) center/cover` : 'var(--neon-cyan)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          {!teacher.avatar_url && (
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#000' }}>
              {teacher.nombre.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: 'white' }}>{teacher.nombre}</h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>
            {teacher.instrumento || 'Profesor de Música Integral'}
          </p>
        </div>
      </div>

      {error && (
        <p style={{ color: 'var(--neon-pink)', fontSize: '12px', margin: 0 }}>{error}</p>
      )}

      <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
        <button
          onClick={handleConnect}
          disabled={loading || connected}
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: '12px',
            border: 'none',
            background: connected ? 'rgba(0, 255, 170, 0.1)' : 'var(--neon-pink)',
            color: connected ? 'var(--neon-cyan)' : 'white',
            fontWeight: 600,
            cursor: connected || loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
            boxShadow: connected ? 'none' : '0 0 15px rgba(255, 0, 122, 0.3)'
          }}
        >
          {loading ? '...' : connected ? <><CheckCircle size={18} /> En tu Red</> : <><UserPlus size={18} /> Conectar</>}
        </button>

        {connected && (
          <Link href={`/profesores/${teacher.id}`} style={{
            flex: 1,
            padding: '12px',
            borderRadius: '12px',
            background: 'var(--neon-cyan)',
            color: 'black',
            textAlign: 'center',
            textDecoration: 'none',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
            boxShadow: '0 0 15px rgba(0, 255, 170, 0.4)'
          }}>
            <Eye size={18} /> Ver Clases
          </Link>
        )}
      </div>
    </div>
  );
}
