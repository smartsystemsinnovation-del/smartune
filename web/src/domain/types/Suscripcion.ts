export interface Suscripcion {
  id: string;
  usuario_id: string;
  tipo: 'gratis' | 'premium' | 'pro' | string;
  fecha_inicio: string;
  fecha_fin?: string;
  estado: 'activa' | 'vencida' | 'cancelada' | string;
}
