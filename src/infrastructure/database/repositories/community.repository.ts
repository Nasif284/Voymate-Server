import { inject, injectable } from 'tsyringe';
import {
  Community as PrismaCommunity,
  PrismaClient,
  $Enums,
} from '@prisma/client';
import { TOKENS } from '../../di/tokens';
import {
  ICommunityRepository,
  CreateCommunityData,
  UpdateCommunityData,
  CommunityModel,
} from '../../../application/interfaces/repositories/community.repository';
import { CommunityVerificationStatus } from '../../../domain/enums/community.constants';

function toCommunityModel(c: PrismaCommunity): CommunityModel {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    email: c.email,
    passwordHash: c.passwordHash,
    phone: c.phone,
    isEmailVerified: c.isEmailVerified,
    emailVerifiedAt: c.emailVerifiedAt,
    tagline: c.tagline,
    description: c.description,
    avatarUrl: c.avatarUrl,
    coverUrl: c.coverUrl,
    city: c.city,
    state: c.state,
    country: c.country,
    instagramHandle: c.instagramHandle,
    websiteUrl: c.websiteUrl,
    isOnboarded: c.isOnboarded,
    verificationStatus:
      c.verificationStatus as unknown as CommunityVerificationStatus,
    isVerified: c.isVerified,
    verificationDocUrl: c.verificationDocUrl,
    verificationNotes: c.verificationNotes,
    verifiedAt: c.verifiedAt,
    rating: Number(c.rating),
    totalTripsCount: c.totalTripsCount,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    deletedAt: c.deletedAt,
  };
}

@injectable()
export class CommunityRepository implements ICommunityRepository {
  constructor(
    @inject(TOKENS.PrismaClient) private readonly _prisma: PrismaClient,
  ) {}

  async findById(id: string): Promise<CommunityModel | null> {
    const c = await this._prisma.community.findUnique({ where: { id } });
    if (!c || c.deletedAt !== null) return null;
    return toCommunityModel(c);
  }

  async findByEmail(email: string): Promise<CommunityModel | null> {
    const c = await this._prisma.community.findUnique({ where: { email } });
    if (!c || c.deletedAt !== null) return null;
    return toCommunityModel(c);
  }

  async findBySlug(slug: string): Promise<CommunityModel | null> {
    const c = await this._prisma.community.findUnique({ where: { slug } });
    if (!c || c.deletedAt !== null) return null;
    return toCommunityModel(c);
  }

  async create(data: CreateCommunityData): Promise<CommunityModel> {
    const c = await this._prisma.community.create({
      data: {
        name: data.name,
        slug: data.slug,
        email: data.email,
        passwordHash: data.passwordHash,
        phone: data.phone,
        city: data.city,
        state: data.state,
        country: data.country || 'India',
        isEmailVerified: data.isEmailVerified ?? false,
      },
    });
    return toCommunityModel(c);
  }

  async update(id: string, data: UpdateCommunityData): Promise<CommunityModel> {
    const c = await this._prisma.community.update({
      where: { id },
      data: {
        ...data,
        verificationStatus: data.verificationStatus
          ? (data.verificationStatus as unknown as $Enums.CommunityVerificationStatus)
          : undefined,
      },
    });
    return toCommunityModel(c);
  }

  async incrementTotalTripsCount(id: string): Promise<void> {
    await this._prisma.community.update({
      where: { id },
      data: {
        totalTripsCount: { increment: 1 },
      },
    });
  }
}
