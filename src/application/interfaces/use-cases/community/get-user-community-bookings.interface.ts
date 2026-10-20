import { UserCommunityBookingResponseDTO } from '../../../dtos/community/booking/response/user-community-booking-response.dto';

export interface IGetUserCommunityBookingsUseCase {
  execute(userId: string): Promise<UserCommunityBookingResponseDTO[]>;
}
