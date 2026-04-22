export interface Cancion {
  id: string;
  autor_id: string;
  titulo: string;
  artista: string;
  dificultad: 'principiante' | 'intermedio' | 'avanzado' | string;
  estado: 'activa' | 'revision' | 'baja' | string;
  fecha_subida: string;
}
