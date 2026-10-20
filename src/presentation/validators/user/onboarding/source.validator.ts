import { z } from 'zod';

export const onboardingSourceSchema = z.object({
  source: z.enum([
    'FRIENDS_FAMILY',
    'SOCIAL_MEDIA',
    'SEARCH_ENGINE',
    'TRAVEL_BLOG',
    'APP_STORE',
    'OTHER',
  ]),
});
