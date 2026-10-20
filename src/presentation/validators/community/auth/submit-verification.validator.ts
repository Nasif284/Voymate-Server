import { z } from 'zod';

export const SubmitCommunityVerificationSchema = z.object({
  notes: z.string().optional().or(z.literal('')),
});
