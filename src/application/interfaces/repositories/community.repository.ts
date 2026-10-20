import {
  CommunityTripCategory,
  CommunityTripPricingType,
  CommunityTripStatus,
  CommunityVerificationStatus,
} from '../../../domain/enums/community.constants';

export interface CreateCommunityData {
  name: string;
  slug: string;
  email: string;
  passwordHash: string;
  phone?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string;
  isEmailVerified?: boolean;
}

export interface UpdateCommunityData {
  name?: string;
  slug?: string;
  passwordHash?: string;
  phone?: string | null;
  isEmailVerified?: boolean;
  emailVerifiedAt?: Date | null;
  tagline?: string | null;
  description?: string | null;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string;
  instagramHandle?: string | null;
  websiteUrl?: string | null;
  isOnboarded?: boolean;
  verificationStatus?: CommunityVerificationStatus;
  isVerified?: boolean;
  verificationDocUrl?: string | null;
  verificationNotes?: string | null;
  verifiedAt?: Date | null;
  rating?: number;
  totalTripsCount?: number;
}

export interface CreateCommunityTripData {
  communityId: string;
  title: string;
  slug: string;
  category: CommunityTripCategory;
  pricingType: CommunityTripPricingType;
  price?: number | null;
  currency?: string;
  priceNote?: string | null;
  destinationName: string;
  city: string;
  state: string;
  country?: string;
  dateFrom: Date;
  dateTo: Date;
  durationText: string;
  maxCapacity: number;
  description: string;
  itinerary: string;
  gallery?: string[];
  inclusions?: string | null;
  exclusions?: string | null;
}

export interface CreateCommunityBookingData {
  bookingCode: string;
  tripId: string;
  userId: string;
  contactName: string;
  contactPhone: string;
  emergencyPhone?: string | null;
  note?: string | null;
  amount: number;
  currency?: string;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
}

export interface CommunityTripFilterCriteria {
  category?: CommunityTripCategory;
  pricingType?: CommunityTripPricingType;
  destination?: string;
  status?: CommunityTripStatus;
  communityId?: string;
  page?: number;
  limit?: number;
}

export interface CommunityModel {
  id: string;
  name: string;
  slug: string;
  email: string;
  passwordHash: string;
  phone: string | null;
  isEmailVerified: boolean;
  emailVerifiedAt: Date | null;
  tagline: string | null;
  description: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  city: string | null;
  state: string | null;
  country: string;
  instagramHandle: string | null;
  websiteUrl: string | null;
  isOnboarded: boolean;
  verificationStatus: CommunityVerificationStatus;
  isVerified: boolean;
  verificationDocUrl: string | null;
  verificationNotes: string | null;
  verifiedAt: Date | null;
  rating: number;
  totalTripsCount: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CommunityOrganizerSummary {
  id: string;
  name: string;
  slug: string;
  avatarUrl: string | null;
  isVerified: boolean;
  rating: number;
  city: string | null;
  state: string | null;
}

export interface CommunityTripModel {
  id: string;
  communityId: string;
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
  inclusions: string | null;
  exclusions: string | null;
  status: CommunityTripStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CommunityTripWithOrganizer extends CommunityTripModel {
  community: CommunityOrganizerSummary;
}

export interface CommunityBookingModel {
  id: string;
  bookingCode: string;
  tripId: string;
  userId: string;
  contactName: string;
  contactPhone: string;
  emergencyPhone: string | null;
  note: string | null;
  amount: number;
  currency: string;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  bookedAt: Date;
  createdAt: Date;
}

export interface CommunityBookingWithTrip extends CommunityBookingModel {
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

export interface CommunityBookingWithUser extends CommunityBookingModel {
  user: {
    id: string;
    fullName: string;
    email: string;
    avatarUrl: string | null;
    phone: string | null;
  };
}

export interface ICommunityRepository {
  findById(id: string): Promise<CommunityModel | null>;
  findByEmail(email: string): Promise<CommunityModel | null>;
  findBySlug(slug: string): Promise<CommunityModel | null>;
  create(data: CreateCommunityData): Promise<CommunityModel>;
  update(id: string, data: UpdateCommunityData): Promise<CommunityModel>;
  incrementTotalTripsCount(id: string): Promise<void>;
}

export interface ICommunityTripRepository {
  findById(id: string): Promise<CommunityTripWithOrganizer | null>;
  findBySlug(slug: string): Promise<CommunityTripWithOrganizer | null>;
  create(data: CreateCommunityTripData): Promise<CommunityTripWithOrganizer>;
  update(
    id: string,
    data: Partial<CreateCommunityTripData>,
  ): Promise<CommunityTripModel>;
  findManyWithFilters(
    filters: CommunityTripFilterCriteria,
  ): Promise<{ trips: CommunityTripWithOrganizer[]; total: number }>;
  findByCommunityId(
    communityId: string,
    page?: number,
    limit?: number,
  ): Promise<{ trips: CommunityTripWithOrganizer[]; total: number }>;
  incrementJoinedCount(tripId: string): Promise<void>;
}

export interface ICommunityBookingRepository {
  findById(id: string): Promise<CommunityBookingModel | null>;
  findByBookingCode(code: string): Promise<CommunityBookingModel | null>;
  findByTripAndUser(
    tripId: string,
    userId: string,
  ): Promise<CommunityBookingModel | null>;
  create(data: CreateCommunityBookingData): Promise<CommunityBookingModel>;
  findByUserId(userId: string): Promise<CommunityBookingWithTrip[]>;
  findByTripId(tripId: string): Promise<CommunityBookingWithUser[]>;
}
