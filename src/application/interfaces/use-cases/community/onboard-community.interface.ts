import { OnboardCommunityRequestDTO } from '../../../dtos/community/auth/request/onboard-community.dto';
import { CommunityProfileResponseDTO } from '../../../dtos/community/auth/response/community-profile.dto';

export interface IOnboardCommunityUseCase {
  execute(
    dto: OnboardCommunityRequestDTO,
  ): Promise<CommunityProfileResponseDTO>;
}
