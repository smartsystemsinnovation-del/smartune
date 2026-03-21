'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { PhoneCall, X } from 'lucide-react';

interface IncomingCallPayload {
  meetLink: string;
  callerName: string;
  callerAvatar?: string;
}

export default function IncomingCallModal({ currentUserId }: { currentUserId: string }) {
  const [callData, setCallData] = useState<IncomingCallPayload | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase.channel('calls');

    channel
      .on(
        'broadcast',
        { event: `incoming_call_${currentUserId}` },
        (payload: any) => {
          console.log('Llamada entrante recibida:', payload);
          setCallData(payload.payload as IncomingCallPayload);
        }
      )
      .subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          console.log('Suscrito a notificaciones de llamadas.');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, supabase]);

  if (!callData) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md transition-all duration-300">
      <div className="bg-[#12121a] border border-[#f6339a]/50 shadow-[0_0_30px_rgba(246,51,154,0.3)] rounded-2xl p-8 max-w-sm w-full mx-4 flex flex-col items-center animate-in zoom-in-95 fade-in duration-300">
        
        {/* Pulsing Avatar Area */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-[#f6339a] rounded-full animate-ping opacity-75"></div>
          {callData.callerAvatar ? (
            <img 
              src={callData.callerAvatar} 
              alt={callData.callerName} 
              className="relative w-24 h-24 rounded-full object-cover border-2 border-[#f6339a] z-10"
            />
          ) : (
            <div className="relative w-24 h-24 rounded-full bg-[#2a2a35] flex items-center justify-center border-2 border-[#f6339a] z-10">
              <PhoneCall size={32} className="text-[#f6339a]" />
            </div>
          )}
        </div>

        <h3 className="text-2xl font-bold text-white mb-2 text-center">
          {callData.callerName}
        </h3>
        <p className="text-[#a1a1aa] text-center mb-8">Te está invitando a una clase instantánea...</p>

        <div className="flex gap-4 w-full">
          <button 
            onClick={() => setCallData(null)}
            className="flex-1 bg-transparent border border-red-500 text-red-500 hover:bg-red-500/10 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            <X size={20} /> Rechazar
          </button>
          
          <button 
            onClick={() => {
              window.open(callData.meetLink, '_blank');
              setCallData(null);
            }}
            className="flex-1 bg-[#f6339a] hover:bg-[#ff4db8] shadow-[0_0_15px_rgba(246,51,154,0.5)] text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
          >
            <PhoneCall size={20} /> Unirse
          </button>
        </div>
      </div>
    </div>
  );
}
