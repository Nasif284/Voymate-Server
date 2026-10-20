import { MatchDestinationDTO } from './calculate-mathc.dto';
export interface Trip {
  id: string;
  name: string;
  destinationId: string;
  dateFrom: Date;
  dateTo: Date;
  budgetStyleCode: string;
  travelStyleCode: string;
  destination: MatchDestinationDTO;
}
export interface GetUserTripsResponseDTO {
  trips: Trip[];
}
