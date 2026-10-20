import { inject, injectable } from 'tsyringe';
import crypto from 'crypto';
import { TOKENS } from '../../../infrastructure/di/tokens';
import { ICommunityRepository } from '../../interfaces/repositories/community.repository';
import { IStorageService } from '../../interfaces/services/storage.service.interface';
import { ISubmitCommunityVerificationUseCase } from '../../interfaces/use-cases/community/submit-community-verification.interface';
import { SubmitCommunityVerificationRequestDTO } from '../../dtos/community/auth/request/submit-community-verification.dto';
import { CommunityProfileResponseDTO } from '../../dtos/community/auth/response/community-profile.dto';
import { CommunityVerificationStatus } from '../../../domain/enums/community.constants';
import { CommunityNotFoundError } from '../../../domain/errors/community.error';

@injectable()
export class SubmitCommunityVerificationUseCase implements ISubmitCommunityVerificationUseCase {
  constructor(
    @inject(TOKENS.ICommunityRepository)
    private readonly _communityRepository: ICommunityRepository,
    @inject(TOKENS.IStorageService)
    private readonly _storageService: IStorageService,
  ) {}

  async execute(
    dto: SubmitCommunityVerificationRequestDTO,
  ): Promise<CommunityProfileResponseDTO> {
    const community = await this._communityRepository.findById(dto.communityId);
    if (!community || community.deletedAt !== null) {
      throw new CommunityNotFoundError();
    }

    const docKey = `communities/verifications/${crypto.randomUUID()}`;
    await this._storageService.upload(
      dto.documentBuffer,
      docKey,
      dto.mimeType || 'application/pdf',
    );

    const updated = await this._communityRepository.update(dto.communityId, {
      verificationDocUrl: docKey,
      verificationStatus: CommunityVerificationStatus.PENDING,
      verificationNotes: dto.notes ? dto.notes.trim() || null : null,
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
