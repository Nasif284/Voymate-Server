import { JoinFreeCommunityTripRequestDTO } from '../../../dtos/community/booking/request/join-free-community-trip.dto';
import { BookingResponseDTO } from '../../../dtos/community/booking/response/booking-response.dto';

export interface IJoinFreeCommunityTripUseCase {
  execute(dto: JoinFreeCommunityTripRequestDTO): Promise<BookingResponseDTO>;
}
