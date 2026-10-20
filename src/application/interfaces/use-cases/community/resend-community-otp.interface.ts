import { ResendCommunityOtpRequestDTO } from '../../../dtos/community/auth/request/resend-community-otp.dto';

export interface IResendCommunityOtpUseCase {
  execute(dto: ResendCommunityOtpRequestDTO): Promise<void>;
}
