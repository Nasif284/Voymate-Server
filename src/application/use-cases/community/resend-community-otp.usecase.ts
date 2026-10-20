import { inject, injectable } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import { ICommunityRepository } from '../../interfaces/repositories/community.repository';
import { IOtpService } from '../../interfaces/services/otp.service.interface';
import { IResendCommunityOtpUseCase } from '../../interfaces/use-cases/community/resend-community-otp.interface';
import { ResendCommunityOtpRequestDTO } from '../../dtos/community/auth/request/resend-community-otp.dto';
import { CommunityNotFoundError } from '../../../domain/errors/community.error';

@injectable()
export class ResendCommunityOtpUseCase implements IResendCommunityOtpUseCase {
  constructor(
    @inject(TOKENS.ICommunityRepository)
    private readonly _communityRepository: ICommunityRepository,
    @inject(TOKENS.IOtpService)
    private readonly _otpService: IOtpService,
  ) {}

  async execute(dto: ResendCommunityOtpRequestDTO): Promise<void> {
    const normalizedEmail = dto.email.toLowerCase().trim();

    const community =
      await this._communityRepository.findByEmail(normalizedEmail);
    if (!community) {
      throw new CommunityNotFoundError();
    }

    if (community.isEmailVerified) {
      return;
    }

    await this._otpService.send(normalizedEmail, 'email_verify');
  }
}
