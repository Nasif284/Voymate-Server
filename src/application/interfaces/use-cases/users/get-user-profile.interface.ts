import { GetUserProfileResponseDTO } from '../../../dtos/users/response/user-profile.dto';

export interface IGetUserProfile {
  execute(dto: {
    userId: string;
    currentUserId?: string;
  }): Promise<GetUserProfileResponseDTO>;
}
