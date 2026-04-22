export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  rol: 'estudiante' | 'profesor' | 'admin' | string;
  estado_suscripcion: 'activa' | 'inactiva' | 'cancelada' | string;
  avatar_url?: string;
  instrumento?: string;
}
