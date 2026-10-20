import { inject, injectable } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import { ICommunityRepository } from '../../interfaces/repositories/community.repository';
import { IStorageService } from '../../interfaces/services/storage.service.interface';
import { IGetCommunityProfileUseCase } from '../../interfaces/use-cases/community/get-community-profile.interface';
import { CommunityProfileResponseDTO } from '../../dtos/community/auth/response/community-profile.dto';
import { CommunityNotFoundError } from '../../../domain/errors/community.error';

@injectable()
export class GetCommunityProfileUseCase implements IGetCommunityProfileUseCase {
  constructor(
    @inject(TOKENS.ICommunityRepository)
    private readonly _communityRepository: ICommunityRepository,
    @inject(TOKENS.IStorageService)
    private readonly _storageService: IStorageService,
  ) {}

  async execute(communityId: string): Promise<CommunityProfileResponseDTO> {
    const community = await this._communityRepository.findById(communityId);
    if (!community || community.deletedAt !== null) {
      throw new CommunityNotFoundError();
    }

    let resolvedAvatarUrl = community.avatarUrl;
    if (resolvedAvatarUrl && !resolvedAvatarUrl.startsWith('http')) {
      resolvedAvatarUrl =
        await this._storageService.getSignedUrl(resolvedAvatarUrl);
    }

    let resolvedCoverUrl = community.coverUrl;
    if (resolvedCoverUrl && !resolvedCoverUrl.startsWith('http')) {
      resolvedCoverUrl =
        await this._storageService.getSignedUrl(resolvedCoverUrl);
    }

    return {
      id: community.id,
      name: community.name,
      slug: community.slug,
      email: community.email,
      phone: community.phone,
      tagline: community.tagline,
      description: community.description,
      avatarUrl: resolvedAvatarUrl,
      coverUrl: resolvedCoverUrl,
      city: community.city,
      state: community.state,
      country: community.country,
      instagramHandle: community.instagramHandle,
      websiteUrl: community.websiteUrl,
      isOnboarded: community.isOnboarded,
      isEmailVerified: community.isEmailVerified,
      verificationStatus: community.verificationStatus,
      isVerified: community.isVerified,
      rating: Number(community.rating),
      totalTripsCount: community.totalTripsCount,
      createdAt: community.createdAt,
    };
  }
}
