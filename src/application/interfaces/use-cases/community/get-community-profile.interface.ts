import { CommunityProfileResponseDTO } from '../../../dtos/community/auth/response/community-profile.dto';

export interface IGetCommunityProfileUseCase {
  execute(communityId: string): Promise<CommunityProfileResponseDTO>;
}
