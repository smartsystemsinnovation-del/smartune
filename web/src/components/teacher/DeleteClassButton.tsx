'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function DeleteClassButton({ classId }: { classId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta clase?')) return;

    setIsDeleting(true);
    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', classId);

    if (error) {
      alert('Error al eliminar la clase: ' + error.message);
      setIsDeleting(false);
    } else {
      router.refresh();
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        padding: '10px 18px',
        background: 'transparent',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        color: 'rgba(255, 255, 255, 0.4)',
        borderRadius: '10px',
        cursor: isDeleting ? 'not-allowed' : 'pointer',
        fontSize: '13px',
        fontWeight: 500,
        fontFamily: 'inherit',
        transition: 'all 0.2s',
        opacity: isDeleting ? 0.4 : 1,
        whiteSpace: 'nowrap' as const,
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255, 80, 80, 0.4)';
        e.currentTarget.style.color = 'rgba(255, 100, 100, 0.9)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)';
      }}
    >
      <Trash2 size={14} strokeWidth={1.5} /> {isDeleting ? 'Eliminando…' : 'Eliminar'}
    </button>
  );
}
