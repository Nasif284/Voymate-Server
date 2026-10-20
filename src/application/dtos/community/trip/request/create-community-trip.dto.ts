import {
  CommunityTripCategory,
  CommunityTripPricingType,
} from '../../../../../domain/enums/community.constants';

export interface CreateCommunityTripRequestDTO {
  communityId: string;
  title: string;
  category: CommunityTripCategory;
  pricingType: CommunityTripPricingType;
  price?: number;
  currency?: string;
  priceNote?: string;
  destinationName: string;
  city: string;
  state: string;
  country?: string;
  dateFrom: Date | string;
  dateTo: Date | string;
  durationText: string;
  maxCapacity: number;
  description: string;
  itinerary: string;
  galleryFiles?: { buffer: Buffer; mimeType: string }[];
  galleryUrls?: string[];
  inclusions?: string;
  exclusions?: string;
}
