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
        gap: '8px',
        padding: '10px 16px',
        background: 'rgba(255, 0, 122, 0.1)',
        border: '1px solid var(--neon-pink)',
        color: 'var(--neon-pink)',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 600,
        transition: 'all 0.3s',
        opacity: isDeleting ? 0.5 : 1
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.background = 'var(--neon-pink)';
        e.currentTarget.style.color = 'white';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.background = 'rgba(255, 0, 122, 0.1)';
        e.currentTarget.style.color = 'var(--neon-pink)';
      }}
    >
      <Trash2 size={16} /> {isDeleting ? 'Eliminando...' : 'Eliminar Clase'}
    </button>
  );
}
