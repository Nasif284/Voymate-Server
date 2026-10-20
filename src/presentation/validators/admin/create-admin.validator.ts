import { z } from 'zod';
import { normalizeAdminRole } from '../../../domain/enums/admin-role.enum';

export const CreateAdminSchema = z.object({
  fullName: z
    .string()
    .min(4, 'Full name must be at least 4 characters.')
    .max(100, 'Full name cannot exceed 100 characters.')
    .trim(),

  email: z.email('Invalid email address format.').toLowerCase().trim(),

  password: z.string(),
  // .min(8, 'Password must be at least 8 characters.')
  // .max(128, 'Password cannot exceed 128 characters.')
  // .regex(
  //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
  //   'Password must contain at least one uppercase letter, one lowercase and one number.',
  // ),
  role: z.string().refine((val) => normalizeAdminRole(val) !== null, {
    message:
      'Invalid admin role. Allowed roles: Super Admin, Moderator, Analyst.',
  }),
});
