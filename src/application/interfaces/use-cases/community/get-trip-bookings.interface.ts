import { TripBookingAttendeeResponseDTO } from '../../../dtos/community/booking/response/trip-booking-attendee-response.dto';

export interface IGetTripBookingsUseCase {
  execute(dto: {
    communityId: string;
    tripId: string;
  }): Promise<TripBookingAttendeeResponseDTO[]>;
}
