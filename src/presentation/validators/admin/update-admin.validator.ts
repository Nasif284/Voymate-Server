import { z } from 'zod';
import { normalizeAdminRole } from '../../../domain/enums/admin-role.enum';

export const UpdateAdminSchema = z.object({
  role: z
    .string()
    .refine((val) => !val || normalizeAdminRole(val) !== null, {
      message:
        'Invalid admin role. Allowed roles: Super Admin, Moderator, Analyst.',
    })
    .optional(),
  status: z
    .object({
      statusCode: z
        .enum(['active', 'suspended', 'deactivated', ''], {
          error: 'Invalid account status.',
        })
        .optional(),

      reason: z
        .string()
        .trim()
        .max(500, 'Reason cannot exceed 500 characters.')
        .optional(),
    })
    .optional(),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .max(128, 'Password cannot exceed 128 characters.')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase and one number.',
    )
    .optional(),
});
