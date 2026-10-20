import { z } from 'zod';

export const VerifyCommunityEmailSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  code: z.string().min(4, 'Verification code is required').trim(),
});
