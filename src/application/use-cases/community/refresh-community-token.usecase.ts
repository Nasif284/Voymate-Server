import { inject, injectable } from 'tsyringe';
import jwt from 'jsonwebtoken';
import ms, { StringValue } from 'ms';
import { TOKENS } from '../../../infrastructure/di/tokens';
import { ICommunityRepository } from '../../interfaces/repositories/community.repository';
import { ITokenService } from '../../interfaces/services/token.service.interface';
import { ISessionService } from '../../interfaces/services/session.service.interface';
import { IStorageService } from '../../interfaces/services/storage.service.interface';
import {
  IRefreshCommunityTokenUseCase,
  RefreshCommunityTokenResponseDTO,
} from '../../interfaces/use-cases/community/refresh-community-token.interface';
import {
  InvalidCommunityCredentialsError,
  CommunityNotFoundError,
} from '../../../domain/errors/community.error';
import { config } from '../../../config/env.config';

@injectable()
export class RefreshCommunityTokenUseCase implements IRefreshCommunityTokenUseCase {
  private readonly _refreshTtl: number;

  constructor(
    @inject(TOKENS.ICommunityRepository)
    private readonly _communityRepository: ICommunityRepository,
    @inject(TOKENS.ITokenService)
    private readonly _tokenService: ITokenService,
    @inject(TOKENS.ISessionService)
    private readonly _sessionService: ISessionService,
    @inject(TOKENS.IStorageService)
    private readonly _storageService: IStorageService,
  ) {
    this._refreshTtl =
      ms((config.jwt.refreshExpiration ?? '7d') as StringValue) / 1000;
  }

  async execute(
    refreshToken: string,
  ): Promise<RefreshCommunityTokenResponseDTO> {
    const decoded = jwt.decode(refreshToken) as {
      userId?: string;
      email?: string;
      role?: string;
    } | null;

    if (!decoded?.userId) {
      throw new InvalidCommunityCredentialsError();
    }

    const tokenHash = this._tokenService.hashToken(refreshToken);
    const isValid = await this._sessionService.isValid(
      decoded.userId,
      tokenHash,
    );

    if (!isValid) {
      throw new InvalidCommunityCredentialsError();
    }

    const community = await this._communityRepository.findById(decoded.userId);
    if (!community || community.deletedAt !== null) {
      throw new CommunityNotFoundError();
    }

    await this._sessionService.revoke(decoded.userId, tokenHash);

    const newAccessToken = this._tokenService.generateAccessToken({
      userId: community.id,
      email: community.email,
      role: 'COMMUNITY',
    });

    const newRefreshToken = this._tokenService.generateRefreshToken({
      userId: community.id,
      email: community.email,
      role: 'COMMUNITY',
    });

    const newRefreshTokenHash = this._tokenService.hashToken(newRefreshToken);
    await this._sessionService.store(
      community.id,
      newRefreshTokenHash,
      this._refreshTtl,
    );

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
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      community: {
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
      },
    };
  }
}
