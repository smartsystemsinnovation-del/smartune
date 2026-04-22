import { z } from 'zod';

export const validateCertificateSchema = z.object({
  documentBase64: z.string().min(10, 'documentBase64 is required and must be valid'),
  mimeType: z.string().min(1, 'mimeType is required')
});

export const generateMusicSchema = z.object({
  prompt: z.string().min(2, 'El prompt es obligatorio').max(1000),
  mode: z.enum(['generate', 'chat']).optional().default('generate')
});
