import {
  CommunityTripCategory,
  CommunityTripPricingType,
  CommunityTripStatus,
} from '../../../../../domain/enums/community.constants';

export interface ListCommunityTripsRequestDTO {
  category?: CommunityTripCategory;
  pricingType?: CommunityTripPricingType;
  destination?: string;
  communityId?: string;
  status?: CommunityTripStatus;
  page?: number;
  limit?: number;
}
