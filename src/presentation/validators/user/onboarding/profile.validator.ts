import { z } from 'zod';

export const OnboardingProfileSchema = z.object({
  about: z
    .string()
    .min(20, 'Tell us a little more about yourself.')
    .max(500, 'About section cannot exceed 500 characters.'),

  dateOfBirth: z.coerce.date({
    error: 'Please select a valid date of birth.',
  }),

  nationality: z.string().min(1, 'Nationality is required.'),
  city: z.string().min(1, 'City is required.'),
  state: z.string().min(1, 'City is required.'),
  gender: z.enum(['MALE', 'FEMALE', 'NON_BINARY'], {
    error: 'Please select a gender.',
  }),

  travelSkills: z
    .array(z.string())
    .min(1, 'Add at least one travel skill.')
    .max(10),

  languages: z.array(z.string()).min(1, 'Add at least one language.').max(10),
});
