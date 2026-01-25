import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email().max(254),
  name: z.string().min(2).max(80),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(128),
});

export const messageSchema = z.object({
  recipientEmail: z.string().email().max(254),
  subject: z.string().max(120).optional(),
  body: z.string().min(1).max(5000),
});
