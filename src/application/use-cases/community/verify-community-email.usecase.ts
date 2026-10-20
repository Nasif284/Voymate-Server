import { inject, injectable } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import { ICommunityRepository } from '../../interfaces/repositories/community.repository';
import { IOtpService } from '../../interfaces/services/otp.service.interface';
import { IVerifyCommunityEmailUseCase } from '../../interfaces/use-cases/community/verify-community-email.interface';
import { VerifyCommunityEmailRequestDTO } from '../../dtos/community/auth/request/verify-community-email.dto';
import { VerifyCommunityEmailResponseDTO } from '../../dtos/community/auth/response/verify-community-email.dto';
import { CommunityNotFoundError } from '../../../domain/errors/community.error';

@injectable()
export class VerifyCommunityEmailUseCase implements IVerifyCommunityEmailUseCase {
  constructor(
    @inject(TOKENS.ICommunityRepository)
    private readonly _communityRepository: ICommunityRepository,
    @inject(TOKENS.IOtpService)
    private readonly _otpService: IOtpService,
  ) {}

  async execute(
    dto: VerifyCommunityEmailRequestDTO,
  ): Promise<VerifyCommunityEmailResponseDTO> {
    const normalizedEmail = dto.email.toLowerCase().trim();

    const community =
      await this._communityRepository.findByEmail(normalizedEmail);
    if (!community) {
      throw new CommunityNotFoundError();
    }

    if (community.isEmailVerified) {
      return {
        email: community.email,
        isEmailVerified: true,
      };
    }

    await this._otpService.verify(
      normalizedEmail,
      dto.code.trim(),
      'email_verify',
    );

    await this._communityRepository.update(community.id, {
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
    });

    return {
      email: community.email,
      isEmailVerified: true,
    };
  }
}
