'use client';

import { useState } from 'react';
import { PhoneCall, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface InstantCallButtonProps {
  targetUserId: string;
  teacherName: string;
  teacherAvatar?: string;
}

export default function InstantCallButton({ targetUserId, teacherName, teacherAvatar }: InstantCallButtonProps) {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleHammerCall = async () => {
    try {
      setLoading(true);
      
      // 1. Generar Meet Link via REST API (Requiere login con Google del profesor)
      const res = await fetch('/api/meet/instant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId })
      });

      const data = await res.json();
      
      if (!res.ok) {
        alert(data.error || 'Error al generar la videollamada.');
        setLoading(false);
        return;
      }

      const meetLink = data.meetLink;

      // 2. Transmitir el evento "Hammer" vía Supabase Realtime directamente al alumno
      const channel = supabase.channel('calls');
      await channel.send({
        type: 'broadcast',
        event: `incoming_call_${targetUserId}`,
        payload: {
          meetLink,
          callerName: teacherName,
          callerAvatar: teacherAvatar
        }
      });

      // 3. Abrir la llamada para el profesor
      window.open(meetLink, '_blank');

    } catch (error) {
      console.error(error);
      alert('Hubo un problema de conexión al iniciar el "Hammer Call".');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleHammerCall}
      disabled={loading}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '14px 24px',
        background: 'transparent',
        border: '1px solid var(--neon-pink)',
        color: 'var(--neon-pink)',
        borderRadius: '12px',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontWeight: 600,
        fontSize: '15px',
        transition: 'all 0.3s',
        boxShadow: 'inset 0 0 10px rgba(246, 51, 154, 0.1)'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.background = 'rgba(246, 51, 154, 0.1)';
        e.currentTarget.style.boxShadow = 'inset 0 0 15px rgba(246, 51, 154, 0.3)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.boxShadow = 'inset 0 0 10px rgba(246, 51, 154, 0.1)';
      }}
    >
      {loading ? (
        <><Loader2 size={18} className="animate-spin" /> Conectando...</>
      ) : (
        <><PhoneCall size={18} /> Llamada Instantánea</>
      )}
    </button>
  );
}
