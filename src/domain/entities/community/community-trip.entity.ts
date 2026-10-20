import {
  CommunityTripCategory,
  CommunityTripPricingType,
  CommunityTripStatus,
} from '../../enums/community.constants';
import { InvalidTripDatesError } from '../../errors/community.error';

export class CommunityTrip {
  constructor(
    public readonly id: string,
    public communityId: string,
    public title: string,
    public slug: string,
    public category: CommunityTripCategory,
    public pricingType: CommunityTripPricingType,
    public price: number | null,
    public currency: string,
    public priceNote: string | null,
    public destinationName: string,
    public city: string,
    public state: string,
    public country: string,
    public dateFrom: Date,
    public dateTo: Date,
    public durationText: string,
    public maxCapacity: number,
    public joinedCount: number,
    public description: string,
    public itinerary: string,
    public gallery: string[],
    public inclusions: string | null,
    public exclusions: string | null,
    public status: CommunityTripStatus,
    public createdAt: Date,
    public updatedAt: Date,
    public deletedAt: Date | null = null,
  ) {}

  get primaryCoverImage(): string | null {
    return this.gallery[0] || null;
  }

  isUpcoming(): boolean {
    return new Date(this.dateFrom) > new Date();
  }

  isFree(): boolean {
    return this.pricingType === 'FREE';
  }

  hasAvailableSlots(): boolean {
    return this.joinedCount < this.maxCapacity;
  }

  validateDates(): void {
    if (new Date(this.dateFrom) >= new Date(this.dateTo)) {
      throw new InvalidTripDatesError();
    }
  }
}
