import { z } from 'zod';

export const TravelStyleSchema = z.object({
  travelType: z.enum(['BUDGET', 'BACKPACKER', 'LUXURY']),
  interests: z.array(z.string()).min(1).max(10),
  travelPersonality: z.enum(['INTROVERT', 'AMBIVERT', 'EXTROVERT']),
  matchWith: z.enum(['MEN', 'WOMEN', 'EVERYONE']),
});
