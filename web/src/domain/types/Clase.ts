export interface Clase {
  id: string;
  teacher_id: string;
  student_id: string;
  title: string;
  scheduled_at: string;
  meet_link?: string;
  status: 'pendiente' | 'completada' | 'cancelada' | string;
}
