import { CommunityProfileResponseDTO } from '../../../dtos/community/auth/response/community-profile.dto';

export interface RefreshCommunityTokenResponseDTO {
  accessToken: string;
  refreshToken: string;
  community: CommunityProfileResponseDTO;
}

export interface IRefreshCommunityTokenUseCase {
  execute(refreshToken: string): Promise<RefreshCommunityTokenResponseDTO>;
}
