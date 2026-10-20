import {
  CommunityTripCategory,
  CommunityTripPricingType,
  CommunityTripStatus,
} from '../../../../../domain/enums/community.constants';

export interface CommunityTripItemResponseDTO {
  id: string;
  title: string;
  slug: string;
  category: CommunityTripCategory;
  pricingType: CommunityTripPricingType;
  price: number | null;
  currency: string;
  priceNote: string | null;
  destinationName: string;
  city: string;
  state: string;
  country: string;
  dateFrom: Date;
  dateTo: Date;
  durationText: string;
  maxCapacity: number;
  joinedCount: number;
  description: string;
  itinerary: string;
  gallery: string[];
  coverImage: string | null;
  inclusions: string | null;
  exclusions: string | null;
  status: CommunityTripStatus;
  community: {
    id: string;
    name: string;
    slug: string;
    avatarUrl: string | null;
    isVerified: boolean;
    rating: number;
    city: string | null;
    state: string | null;
  };
  createdAt: Date;
}
