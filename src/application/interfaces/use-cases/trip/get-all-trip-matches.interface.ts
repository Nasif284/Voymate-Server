import { TripMatchResponseDTO } from '../../../dtos/trip/responce/get-matches.dto';

export interface IGetAllTripMatches {
  execute(dto: {
    userId: string;
    page?: number;
    limit?: number;
  }): Promise<TripMatchResponseDTO>;
}
