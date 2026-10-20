import { TripMatchResponseDTO } from '../../../dtos/trip/responce/get-matches.dto';

export interface SearchTripMatchesRequestDTO {
  userId: string;
  destinationName?: string;
  city?: string;
  state?: string;
  countryCode?: string;
  dateFrom?: Date;
  dateTo?: Date;
  travelStyle?: string;
  budgetStyle?: string;
  page?: number;
  limit?: number;
}

export interface ISearchTripMatches {
  execute(dto: SearchTripMatchesRequestDTO): Promise<TripMatchResponseDTO>;
}
