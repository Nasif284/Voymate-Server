import { CommunityVerificationStatus } from '../../../../../domain/enums/community.constants';

export interface CommunityProfileResponseDTO {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string | null;
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
  isEmailVerified: boolean;
  verificationStatus: CommunityVerificationStatus;
  isVerified: boolean;
  rating: number;
  totalTripsCount: number;
  createdAt: Date;
}
