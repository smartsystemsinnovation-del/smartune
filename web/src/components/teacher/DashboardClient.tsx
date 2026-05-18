'use client';

import { useState, useMemo } from 'react';
import { Video, Calendar, Search, X, Users, BookOpen } from 'lucide-react';
import Link from 'next/link';
import LocalTime from '@/components/LocalTime';
import InstantCallButton from '@/components/teacher/InstantCallButton';
import DeleteClassButton from '@/components/teacher/DeleteClassButton';
import styles from './Dashboard.module.css';

interface StudentInfo {
  nombre: string;
  correo: string;
  avatar_url?: string;
}

interface ClassItem {
  id: string;
  title: string;
  instrument?: string;
  scheduled_at: string;
  meet_link?: string;
  student_id: string;
  student: StudentInfo | StudentInfo[];
}

interface DashboardClientProps {
  classes: ClassItem[] | null;
  teacherName: string;
  teacherAvatar?: string;
}

export default function DashboardClient({ classes, teacherName, teacherAvatar }: DashboardClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'student' | 'class'>('all');

  // Extract unique students for the filter chips
  const uniqueStudents = useMemo(() => {
    if (!classes) return [];
    const map = new Map<string, string>();
    classes.forEach(cls => {
      const student = Array.isArray(cls.student) ? cls.student[0] : cls.student;
      if (student?.nombre) {
        map.set(cls.student_id, student.nombre);
      }
    });
    return Array.from(map.entries()); // [id, nombre]
  }, [classes]);

  // Filter classes based on query + mode
  const filteredClasses = useMemo(() => {
    if (!classes) return [];
    const q = searchQuery.toLowerCase().trim();
    if (!q) return classes;

    return classes.filter(cls => {
      const student = Array.isArray(cls.student) ? cls.student[0] : cls.student;
      const studentName = (student?.nombre || '').toLowerCase();
      const className = (cls.title || '').toLowerCase();
      const instrument = (cls.instrument || '').toLowerCase();

      if (filterMode === 'student') return studentName.includes(q);
      if (filterMode === 'class') return className.includes(q) || instrument.includes(q);
      return studentName.includes(q) || className.includes(q) || instrument.includes(q);
    });
  }, [classes, searchQuery, filterMode]);

  const totalClasses = classes?.length || 0;
  const totalStudents = uniqueStudents.length;

  return (
    <div className={styles.container}>
      <div className={styles.inner}>

        {/* ── Header ── */}
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Panel del Profesor</h1>
            <p className={styles.subtitle}>
              Hola, {teacherName}
            </p>
          </div>
          <Link href="/teacher/clases/meet" className={styles.ctaButton}>
            + Nueva Clase
          </Link>
        </header>

        {/* ── Stats strip ── */}
        <div className={styles.statsStrip}>
          <div className={styles.statItem}>
            <BookOpen size={16} strokeWidth={1.5} />
            <span>{totalClasses} {totalClasses === 1 ? 'clase' : 'clases'}</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <Users size={16} strokeWidth={1.5} />
            <span>{totalStudents} {totalStudents === 1 ? 'alumno' : 'alumnos'}</span>
          </div>
        </div>

        {/* ── Search & Filter Bar ── */}
        <div className={styles.searchSection}>
          <div className={styles.searchBar}>
            <Search size={18} strokeWidth={1.5} className={styles.searchIcon} />
            <input
              type="text"
              placeholder={
                filterMode === 'student' ? 'Buscar por nombre del alumno…'
                : filterMode === 'class' ? 'Buscar por nombre de clase o instrumento…'
                : 'Buscar clase o alumno…'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={styles.clearButton}
                aria-label="Limpiar búsqueda"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className={styles.filterChips}>
            <button
              className={`${styles.chip} ${filterMode === 'all' ? styles.chipActive : ''}`}
              onClick={() => setFilterMode('all')}
            >
              Todo
            </button>
            <button
              className={`${styles.chip} ${filterMode === 'student' ? styles.chipActive : ''}`}
              onClick={() => setFilterMode('student')}
            >
              <Users size={14} /> Alumno
            </button>
            <button
              className={`${styles.chip} ${filterMode === 'class' ? styles.chipActive : ''}`}
              onClick={() => setFilterMode('class')}
            >
              <BookOpen size={14} /> Clase
            </button>
          </div>
        </div>

        {/* ── Classes List ── */}
        <section className={styles.classesSection}>
          {filteredClasses.length === 0 ? (
            <div className={styles.emptyState}>
              {searchQuery ? (
                <>
                  <Search size={48} strokeWidth={1} className={styles.emptyIcon} />
                  <h3 className={styles.emptyTitle}>Sin resultados</h3>
                  <p className={styles.emptyDesc}>
                    No se encontraron clases para &quot;{searchQuery}&quot;
                  </p>
                  <button
                    onClick={() => { setSearchQuery(''); setFilterMode('all'); }}
                    className={styles.emptyAction}
                  >
                    Limpiar filtros
                  </button>
                </>
              ) : (
                <>
                  <Calendar size={48} strokeWidth={1} className={styles.emptyIcon} />
                  <h3 className={styles.emptyTitle}>Sin clases programadas</h3>
                  <p className={styles.emptyDesc}>
                    Comienza a agendar clases con tus alumnos.
                  </p>
                  <Link href="/teacher/clases/meet" className={styles.emptyAction}>
                    Crear mi primera clase
                  </Link>
                </>
              )}
            </div>
          ) : (
            <div className={styles.classList}>
              {filteredClasses.map(cls => {
                const student = Array.isArray(cls.student) ? cls.student[0] : cls.student;
                return (
                  <div key={cls.id} className={styles.classCard}>
                    {/* Left content */}
                    <div className={styles.cardBody}>
                      <div className={styles.cardMeta}>
                        <span className={styles.studentBadge}>
                          {student?.nombre || 'Desconocido'}
                        </span>
                        {cls.instrument && (
                          <span className={styles.instrumentBadge}>
                            {cls.instrument}
                          </span>
                        )}
                      </div>

                      <h3 className={styles.cardTitle}>{cls.title}</h3>

                      <div className={styles.cardTime}>
                        <LocalTime dateIso={cls.scheduled_at} />
                      </div>
                    </div>

                    {/* Right actions */}
                    <div className={styles.cardActions}>
                      {cls.meet_link ? (
                        <a
                          href={cls.meet_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.meetButton}
                        >
                          <Video size={16} strokeWidth={1.5} />
                          <span>Google Meet</span>
                        </a>
                      ) : (
                        <div className={styles.meetDisabled}>
                          <Video size={16} strokeWidth={1.5} />
                          <span>Sin enlace</span>
                        </div>
                      )}

                      {student && (
                        <InstantCallButton
                          targetUserId={cls.student_id}
                          teacherName={teacherName}
                          teacherAvatar={teacherAvatar}
                        />
                      )}

                      <DeleteClassButton classId={cls.id} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Results count ── */}
        {searchQuery && filteredClasses.length > 0 && (
          <p className={styles.resultsCount}>
            {filteredClasses.length} {filteredClasses.length === 1 ? 'resultado' : 'resultados'}
          </p>
        )}

      </div>
    </div>
  );
}
