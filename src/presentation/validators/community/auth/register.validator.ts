import { z } from 'zod';

export const RegisterCommunitySchema = z.object({
  name: z
    .string()
    .min(2, 'Community name must be at least 2 characters')
    .max(150)
    .trim(),
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
});
