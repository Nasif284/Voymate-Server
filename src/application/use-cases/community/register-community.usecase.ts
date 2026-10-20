import { inject, injectable } from 'tsyringe';
import crypto from 'crypto';
import ms, { StringValue } from 'ms';
import { TOKENS } from '../../../infrastructure/di/tokens';
import { ICommunityRepository } from '../../interfaces/repositories/community.repository';
import { IHashService } from '../../interfaces/services/hash.service.interface';
import { ITokenService } from '../../interfaces/services/token.service.interface';
import { ISessionService } from '../../interfaces/services/session.service.interface';
import { IOtpService } from '../../interfaces/services/otp.service.interface';
import { IRegisterCommunityUseCase } from '../../interfaces/use-cases/community/register-community.interface';
import { RegisterCommunityRequestDTO } from '../../dtos/community/auth/request/register-community.dto';
import { RegisterCommunityResponseDTO } from '../../dtos/community/auth/response/register-community.dto';
import { CommunityAlreadyExistsError } from '../../../domain/errors/community.error';
import { slugify } from '../../../shared/helpers/slugify';
import { config } from '../../../config/env.config';

@injectable()
export class RegisterCommunityUseCase implements IRegisterCommunityUseCase {
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
    @inject(TOKENS.IOtpService)
    private readonly _otpService: IOtpService,
  ) {
    this._refreshTtl =
      ms((config.jwt.refreshExpiration ?? '7d') as StringValue) / 1000;
  }

  async execute(
    dto: RegisterCommunityRequestDTO,
  ): Promise<RegisterCommunityResponseDTO> {
    const normalizedEmail = dto.email.toLowerCase().trim();

    const existing =
      await this._communityRepository.findByEmail(normalizedEmail);
    if (existing) {
      throw new CommunityAlreadyExistsError();
    }

    const passwordHash = await this._hashService.hash(dto.password);

    const baseSlug =
      slugify(dto.name) || `community-${crypto.randomUUID().slice(0, 8)}`;
    let slug = baseSlug;
    let counter = 1;
    while (await this._communityRepository.findBySlug(slug)) {
      slug = `${baseSlug}-${counter++}`;
    }

    const community = await this._communityRepository.create({
      name: dto.name.trim(),
      slug,
      email: normalizedEmail,
      passwordHash,
      phone: dto.phone?.trim() ?? null,
      city: dto.city?.trim() ?? null,
      state: dto.state?.trim() ?? null,
      isEmailVerified: false,
    });

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

    await this._otpService.send(community.email, 'email_verify');

    return {
      accessToken,
      refreshToken,
      community: {
        id: community.id,
        name: community.name,
        slug: community.slug,
        email: community.email,
        isEmailVerified: community.isEmailVerified,
      },
    };
  }
}
