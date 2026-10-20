import { CommunityVerificationStatus } from '../../enums/community.constants';

export class Community {
  constructor(
    public readonly id: string,
    public name: string,
    public slug: string,
    public email: string,
    public passwordHash: string,
    public phone: string | null,
    public isEmailVerified: boolean,
    public emailVerifiedAt: Date | null,
    public tagline: string | null,
    public description: string | null,
    public avatarUrl: string | null,
    public coverUrl: string | null,
    public city: string | null,
    public state: string | null,
    public country: string,
    public instagramHandle: string | null,
    public websiteUrl: string | null,
    public isOnboarded: boolean,
    public verificationStatus: CommunityVerificationStatus,
    public isVerified: boolean,
    public verificationDocUrl: string | null,
    public verificationNotes: string | null,
    public verifiedAt: Date | null,
    public rating: number,
    public totalTripsCount: number,
    public createdAt: Date,
    public updatedAt: Date,
    public deletedAt: Date | null = null,
  ) {}

  isProfileComplete(): boolean {
    return Boolean(
      this.name &&
      this.tagline &&
      this.description &&
      this.city &&
      this.state &&
      this.avatarUrl,
    );
  }

  isFullyVerified(): boolean {
    return this.isVerified && this.verificationStatus === 'VERIFIED';
  }
}
