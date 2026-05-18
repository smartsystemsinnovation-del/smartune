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
        gap: '6px',
        padding: '10px 18px',
        background: 'transparent',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        color: 'rgba(255, 255, 255, 0.5)',
        borderRadius: '10px',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontWeight: 500,
        fontSize: '13px',
        fontFamily: 'inherit',
        transition: 'all 0.2s',
        whiteSpace: 'nowrap' as const,
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.18)';
        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
      }}
    >
      {loading ? (
        <><Loader2 size={14} className="animate-spin" /> Conectando…</>
      ) : (
        <><PhoneCall size={14} strokeWidth={1.5} /> Llamada</>
      )}
    </button>
  );
}
