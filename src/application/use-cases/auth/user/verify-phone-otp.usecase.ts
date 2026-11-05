import { inject, injectable } from 'tsyringe';
import { TOKENS } from '../../../../infrastructure/di/tokens';
import { IUserRepository } from '../../../interfaces/repositories/user.reposetory';
import { IPhoneOtpService } from '../../../interfaces/services/phone-otp-storage.service.interface';
import { VerifyPhoneOtpRequestDTO } from '../../../dtos/auth/user/request/verify-phone.dto';
import { InvalidOtpError } from '../../../../domain/errors/auth.error';
import { IVerifyPhoneOtp } from '../../../interfaces/use-cases/auth/user/verify-phone-otp.interface';

@injectable()
export class VerifyPhoneOtp implements IVerifyPhoneOtp {
  constructor(
    @inject(TOKENS.IUserRepository)
    private readonly userRepository: IUserRepository,

    @inject(TOKENS.IPhoneOtpService)
    private readonly phoneOtpService: IPhoneOtpService,
  ) {}

  async execute(dto: VerifyPhoneOtpRequestDTO): Promise<void> {
    const { phone, otp } = dto;

    // Reviewer bypass for App Store / Google Play review
    if (phone.startsWith('+1555') && otp === '123456') {
      await this.userRepository.verifyPhone(dto.userId, phone);
      return;
    }

    const storedOtp = await this.phoneOtpService.get(phone);

    if (!storedOtp || storedOtp !== otp) {
      throw new InvalidOtpError();
    }

    await this.userRepository.verifyPhone(dto.userId, phone);
    await this.phoneOtpService.delete(phone);
  }
}
