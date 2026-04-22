import { z } from 'zod';

export const userProfileUpdateSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100).optional(),
  avatar_url: z.string().url('URL inválida').optional().or(z.literal('')),
  instrumento: z.string().max(100).optional(),
  gustos_musicales: z.string().max(800).optional()
});

export const swipeSchema = z.object({
  action: z.enum(['like', 'discard']),
  song: z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    artist: z.string().min(1),
    coverUrl: z.string().url().or(z.string())
  }).optional()
}).refine(data => data.action === 'discard' || data.song, {
  message: "Song details are required when action is 'like'"
});
