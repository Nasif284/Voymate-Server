import { CommunityProfileResponseDTO } from './community-profile.dto';

export interface LoginCommunityResponseDTO {
  accessToken: string;
  refreshToken: string;
  community: CommunityProfileResponseDTO;
}
