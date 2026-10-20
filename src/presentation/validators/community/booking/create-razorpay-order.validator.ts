import { z } from 'zod';

export const CreateRazorpayOrderSchema = z.object({
  tripId: z.string().uuid('Valid trip ID is required'),
  contactName: z.string().trim().min(2, 'Contact name is required').max(100),
  contactPhone: z
    .string()
    .trim()
    .min(6, 'Valid contact phone is required')
    .max(20),
});
