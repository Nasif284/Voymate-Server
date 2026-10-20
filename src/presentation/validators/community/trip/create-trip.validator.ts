import { z } from 'zod';
import {
  CommunityTripCategory,
  CommunityTripPricingType,
} from '../../../../domain/enums/community.constants';

export const CreateCommunityTripSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, 'Trip title must be at least 3 characters')
      .max(255),
    category: z.nativeEnum(CommunityTripCategory),
    pricingType: z.nativeEnum(CommunityTripPricingType),
    price: z.preprocess(
      (val) =>
        val === '' || val === null || val === undefined ? undefined : val,
      z.coerce.number().min(0, 'Price must be 0 or greater').optional(),
    ),
    currency: z.preprocess(
      (val) => (val === '' || val === null || val === undefined ? 'INR' : val),
      z.string().trim().default('INR').optional(),
    ),
    priceNote: z.string().trim().optional().or(z.literal('')),
    destinationName: z
      .string()
      .trim()
      .min(2, 'Destination name is required')
      .max(255),
    city: z.string().trim().min(1, 'City is required').max(100),
    state: z.string().trim().min(1, 'State is required').max(100),
    country: z.preprocess(
      (val) =>
        val === '' || val === null || val === undefined ? 'India' : val,
      z.string().trim().default('India').optional(),
    ),
    dateFrom: z.coerce.date(),
    dateTo: z.coerce.date(),
    durationText: z
      .string()
      .trim()
      .min(1, 'Duration text is required')
      .max(100),
    maxCapacity: z.coerce
      .number()
      .int()
      .min(1, 'Trip capacity must be at least 1 person'),
    description: z
      .string()
      .trim()
      .min(10, 'Trip description must be at least 10 characters'),
    itinerary: z
      .string()
      .trim()
      .min(10, 'Trip itinerary must be at least 10 characters'),
    galleryUrls: z.preprocess((val) => {
      if (!val || val === '') return [];
      if (typeof val === 'string') {
        try {
          const parsed = JSON.parse(val);
          return Array.isArray(parsed) ? parsed : [val];
        } catch {
          return [val];
        }
      }
      return val;
    }, z.array(z.string()).optional()),
    inclusions: z.string().trim().optional().or(z.literal('')),
    exclusions: z.string().trim().optional().or(z.literal('')),
  })
  .refine(
    (data) => {
      if (data.pricingType === CommunityTripPricingType.PAID) {
        return typeof data.price === 'number' && data.price > 0;
      }
      return true;
    },
    {
      message: 'Price must be greater than 0 for paid trips',
      path: ['price'],
    },
  )
  .refine(
    (data) =>
      new Date(data.dateTo).getTime() >= new Date(data.dateFrom).getTime(),
    {
      message: 'Trip end date must be on or after start date',
      path: ['dateTo'],
    },
  )
  .refine(
    (data) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return new Date(data.dateFrom).getTime() >= today.getTime();
    },
    {
      message: 'Trip start date cannot be in the past',
      path: ['dateFrom'],
    },
  );
