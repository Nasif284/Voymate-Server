import { GetBuddiesUpcomingTripsResponseDTO } from '../../../dtos/trip/responce/get-buddies-upcoming-trips.dto';

export interface IGetBuddiesUpcomingTrips {
  execute(userId: string): Promise<GetBuddiesUpcomingTripsResponseDTO>;
}
