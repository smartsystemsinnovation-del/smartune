'use client';

import { useEffect, useState } from 'react';

export default function LocalTime({ dateIso }: { dateIso: string }) {
  const [formattedDate, setFormattedDate] = useState<string>('…');
  const [formattedTime, setFormattedTime] = useState<string>('…');

  useEffect(() => {
    const dateObj = new Date(dateIso);
    setFormattedDate(dateObj.toLocaleDateString('es-ES', { 
      weekday: 'short', 
      day: 'numeric',
      month: 'short',
    }));
    setFormattedTime(dateObj.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }));
  }, [dateIso]);

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '13px',
      color: 'rgba(255, 255, 255, 0.4)',
      fontWeight: 400,
    }}>
      <span style={{ textTransform: 'capitalize' }}>{formattedDate}</span>
      <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
      <span>{formattedTime}</span>
    </span>
  );
}
