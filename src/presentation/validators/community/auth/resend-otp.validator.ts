import { z } from 'zod';

export const ResendCommunityOtpSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
});
