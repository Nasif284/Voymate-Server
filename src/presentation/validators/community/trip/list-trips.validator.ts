import { z } from 'zod';
import {
  CommunityTripCategory,
  CommunityTripPricingType,
  CommunityTripStatus,
} from '../../../../domain/enums/community.constants';

export const ListCommunityTripsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(12).optional(),
  destination: z.string().trim().optional(),
  category: z.nativeEnum(CommunityTripCategory).optional(),
  pricingType: z.nativeEnum(CommunityTripPricingType).optional(),
  status: z.nativeEnum(CommunityTripStatus).optional(),
  communityId: z.string().uuid().optional(),
});
