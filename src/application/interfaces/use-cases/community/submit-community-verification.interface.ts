import { SubmitCommunityVerificationRequestDTO } from '../../../dtos/community/auth/request/submit-community-verification.dto';
import { CommunityProfileResponseDTO } from '../../../dtos/community/auth/response/community-profile.dto';

export interface ISubmitCommunityVerificationUseCase {
  execute(
    dto: SubmitCommunityVerificationRequestDTO,
  ): Promise<CommunityProfileResponseDTO>;
}
