import { z } from 'zod';

export const OnboardCommunitySchema = z.object({
  tagline: z.string().max(255).optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  city: z.string().max(100).optional().or(z.literal('')),
  state: z.string().max(100).optional().or(z.literal('')),
  country: z.string().max(100).optional().or(z.literal('')),
  instagramHandle: z.string().max(100).optional().or(z.literal('')),
  websiteUrl: z
    .string()
    .url('Invalid website URL')
    .optional()
    .or(z.literal('')),
});
