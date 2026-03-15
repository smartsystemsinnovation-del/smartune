import Navigation from '@/components/Navigation';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import styles from './page.module.css';

export default async function PerfilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/?login=true');
  }

  // Si se proveyó full_name en el registro, usarlo; sino usar el email o fallback
  const fullName = user.user_metadata?.full_name || 'Estudiante Creador';
  const email = user.email || 'usuario@smartune.app';

  return (
    <main className={styles.main}>
      <Navigation />
      
      <div className={styles.profileContainer}>
        <div className={styles.profileHeader}>
          <div className={styles.avatar} />
          <div className={styles.info}>
            <h1 className={styles.name}>{fullName}</h1>
            <p className={styles.email}>{email}</p>
            <div className={styles.roleBadge}>Estudiante Premium</div>
          </div>
        </div>
      </div>
    </main>
  );
}
