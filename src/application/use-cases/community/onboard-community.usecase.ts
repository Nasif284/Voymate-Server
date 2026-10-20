import { inject, injectable } from 'tsyringe';
import crypto from 'crypto';
import { TOKENS } from '../../../infrastructure/di/tokens';
import { ICommunityRepository } from '../../interfaces/repositories/community.repository';
import { IStorageService } from '../../interfaces/services/storage.service.interface';
import { IOnboardCommunityUseCase } from '../../interfaces/use-cases/community/onboard-community.interface';
import { OnboardCommunityRequestDTO } from '../../dtos/community/auth/request/onboard-community.dto';
import { CommunityProfileResponseDTO } from '../../dtos/community/auth/response/community-profile.dto';
import { CommunityNotFoundError } from '../../../domain/errors/community.error';

@injectable()
export class OnboardCommunityUseCase implements IOnboardCommunityUseCase {
  constructor(
    @inject(TOKENS.ICommunityRepository)
    private readonly _communityRepository: ICommunityRepository,
    @inject(TOKENS.IStorageService)
    private readonly _storageService: IStorageService,
  ) {}

  async execute(
    dto: OnboardCommunityRequestDTO,
  ): Promise<CommunityProfileResponseDTO> {
    const community = await this._communityRepository.findById(dto.communityId);
    if (!community || community.deletedAt !== null) {
      throw new CommunityNotFoundError();
    }

    let avatarKey = community.avatarUrl;
    if (dto.avatarBuffer) {
      avatarKey = `communities/avatars/${crypto.randomUUID()}`;
      await this._storageService.upload(
        dto.avatarBuffer,
        avatarKey,
        dto.avatarMimeType || 'image/jpeg',
      );
    }

    let coverKey = community.coverUrl;
    if (dto.coverBuffer) {
      coverKey = `communities/covers/${crypto.randomUUID()}`;
      await this._storageService.upload(
        dto.coverBuffer,
        coverKey,
        dto.coverMimeType || 'image/jpeg',
      );
    }

    const updated = await this._communityRepository.update(dto.communityId, {
      tagline:
        dto.tagline !== undefined
          ? dto.tagline.trim() || null
          : community.tagline,
      description:
        dto.description !== undefined
          ? dto.description.trim() || null
          : community.description,
      avatarUrl: avatarKey,
      coverUrl: coverKey,
      city: dto.city !== undefined ? dto.city.trim() || null : community.city,
      state:
        dto.state !== undefined ? dto.state.trim() || null : community.state,
      country:
        dto.country !== undefined
          ? dto.country.trim() || 'India'
          : community.country,
      instagramHandle:
        dto.instagramHandle !== undefined
          ? dto.instagramHandle.trim() || null
          : community.instagramHandle,
      websiteUrl:
        dto.websiteUrl !== undefined
          ? dto.websiteUrl.trim() || null
          : community.websiteUrl,
      isOnboarded: true,
    });

    let resolvedAvatarUrl = updated.avatarUrl;
    if (resolvedAvatarUrl && !resolvedAvatarUrl.startsWith('http')) {
      resolvedAvatarUrl =
        await this._storageService.getSignedUrl(resolvedAvatarUrl);
    }

    let resolvedCoverUrl = updated.coverUrl;
    if (resolvedCoverUrl && !resolvedCoverUrl.startsWith('http')) {
      resolvedCoverUrl =
        await this._storageService.getSignedUrl(resolvedCoverUrl);
    }

    return {
      id: updated.id,
      name: updated.name,
      slug: updated.slug,
      email: updated.email,
      phone: updated.phone,
      tagline: updated.tagline,
      description: updated.description,
      avatarUrl: resolvedAvatarUrl,
      coverUrl: resolvedCoverUrl,
      city: updated.city,
      state: updated.state,
      country: updated.country,
      instagramHandle: updated.instagramHandle,
      websiteUrl: updated.websiteUrl,
      isOnboarded: updated.isOnboarded,
      isEmailVerified: updated.isEmailVerified,
      verificationStatus: updated.verificationStatus,
      isVerified: updated.isVerified,
      rating: Number(updated.rating),
      totalTripsCount: updated.totalTripsCount,
      createdAt: updated.createdAt,
    };
  }
}
