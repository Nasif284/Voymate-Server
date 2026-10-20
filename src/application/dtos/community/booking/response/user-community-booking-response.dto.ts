import {
  CommunityTripCategory,
  CommunityTripPricingType,
} from '../../../../../domain/enums/community.constants';

export interface UserCommunityBookingResponseDTO {
  id: string;
  bookingCode: string;
  tripId: string;
  contactName: string;
  contactPhone: string;
  emergencyPhone: string | null;
  note: string | null;
  amount: number;
  currency: string;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  bookedAt: Date;
  trip: {
    id: string;
    title: string;
    slug: string;
    category: CommunityTripCategory;
    destinationName: string;
    city: string;
    state: string;
    dateFrom: Date;
    dateTo: Date;
    durationText: string;
    gallery: string[];
    pricingType: CommunityTripPricingType;
    price: number | null;
    currency: string;
    community: {
      id: string;
      name: string;
      slug: string;
      avatarUrl: string | null;
    };
  };
}
