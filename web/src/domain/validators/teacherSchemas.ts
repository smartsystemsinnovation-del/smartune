import { z } from 'zod';

export const createClassSchema = z.object({
  teacherId: z.string().uuid('Invalid teacher ID'),
  studentId: z.string().uuid('Invalid student ID'),
  title: z.string().min(3, 'Title requires at least 3 characters').max(100),
  description: z.string().optional(),
  scheduledAt: z.string().datetime('Must be a valid ISO DateTime string')
});
