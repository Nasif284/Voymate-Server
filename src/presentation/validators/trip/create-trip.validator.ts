import { z } from 'zod';

export const createTripSchema = z
  .object({
    destination: z.object({
      placeId: z.string().min(1),
      displayName: z.string().min(1),
      city: z.string().nullable(),
      state: z.string().nullable(),
      country: z.string(),
      countryCode: z.string().nullable(),
      latitude: z.number(),
      longitude: z.number(),
    }),
    dateFrom: z.string().min(1, 'Departure date is required'),
    dateTo: z.string().min(1, 'Return date is required'),
    budgetStyle: z.enum(['BUDGET', 'MODERATE', 'PREMIUM', 'LUXURY']),
    preferredMembers: z.number().min(1).max(20),
    travelStyleCode: z.enum(['ADVENTURE', 'LEISURE', 'CULTURAL']),
  })
  .refine((data) => new Date(data.dateTo) > new Date(data.dateFrom), {
    path: ['dateTo'],
    message: 'Return date must be after departure date',
  });

export type CreateTripFormData = z.infer<typeof createTripSchema>;
