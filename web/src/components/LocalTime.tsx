'use client';

import { useEffect, useState } from 'react';

export default function LocalTime({ dateIso }: { dateIso: string }) {
  const [formattedDate, setFormattedDate] = useState<string>('Cargando fecha...');
  const [formattedTime, setFormattedTime] = useState<string>('...');

  useEffect(() => {
    const dateObj = new Date(dateIso);
    setFormattedDate(dateObj.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }));
    setFormattedTime(dateObj.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }));
  }, [dateIso]);

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--neon-cyan)', fontSize: '15px', fontWeight: 500 }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
        <span style={{ textTransform: 'capitalize' }}>{formattedDate}</span>
      </div>
      <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--neon-pink)', fontSize: '15px', fontWeight: 600 }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        {formattedTime} hrs
      </div>
    </>
  );
}
