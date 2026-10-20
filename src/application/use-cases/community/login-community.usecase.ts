import { inject, injectable } from 'tsyringe';
import ms, { StringValue } from 'ms';
import { TOKENS } from '../../../infrastructure/di/tokens';
import { ICommunityRepository } from '../../interfaces/repositories/community.repository';
import { IHashService } from '../../interfaces/services/hash.service.interface';
import { ITokenService } from '../../interfaces/services/token.service.interface';
import { ISessionService } from '../../interfaces/services/session.service.interface';
import { IStorageService } from '../../interfaces/services/storage.service.interface';
import { ILoginCommunityUseCase } from '../../interfaces/use-cases/community/login-community.interface';
import { LoginCommunityRequestDTO } from '../../dtos/community/auth/request/login-community.dto';
import { LoginCommunityResponseDTO } from '../../dtos/community/auth/response/login-community.dto';
import { InvalidCommunityCredentialsError } from '../../../domain/errors/community.error';
import { config } from '../../../config/env.config';

@injectable()
export class LoginCommunityUseCase implements ILoginCommunityUseCase {
  private readonly _refreshTtl: number;

  constructor(
    @inject(TOKENS.ICommunityRepository)
    private readonly _communityRepository: ICommunityRepository,
    @inject(TOKENS.IHashService)
    private readonly _hashService: IHashService,
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
    dto: LoginCommunityRequestDTO,
  ): Promise<LoginCommunityResponseDTO> {
    const normalizedEmail = dto.email.toLowerCase().trim();

    const community =
      await this._communityRepository.findByEmail(normalizedEmail);
    if (!community || community.deletedAt !== null) {
      throw new InvalidCommunityCredentialsError();
    }

    const isMatch = await this._hashService.compare(
      dto.password,
      community.passwordHash,
    );
    if (!isMatch) {
      throw new InvalidCommunityCredentialsError();
    }

    const accessToken = this._tokenService.generateAccessToken({
      userId: community.id,
      email: community.email,
      role: 'COMMUNITY',
    });

    const refreshToken = this._tokenService.generateRefreshToken({
      userId: community.id,
      email: community.email,
      role: 'COMMUNITY',
    });

    const tokenHash = this._tokenService.hashToken(refreshToken);
    await this._sessionService.store(community.id, tokenHash, this._refreshTtl);

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
      accessToken,
      refreshToken,
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
