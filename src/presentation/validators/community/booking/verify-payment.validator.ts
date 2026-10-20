import { z } from 'zod';

export const VerifyRazorpayBookingSchema = z.object({
  tripId: z.string().uuid('Valid trip ID is required'),
  contactName: z.string().trim().min(2, 'Contact name is required').max(100),
  contactPhone: z
    .string()
    .trim()
    .min(6, 'Valid contact phone is required')
    .max(20),
  emergencyPhone: z.string().trim().max(20).optional().or(z.literal('')),
  note: z.string().trim().max(500).optional().or(z.literal('')),
  razorpayOrderId: z.string().trim().min(1, 'Order ID is required'),
  razorpayPaymentId: z.string().trim().min(1, 'Payment ID is required'),
  razorpaySignature: z.string().trim().min(1, 'Signature is required'),
});
