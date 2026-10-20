import { CommunityTripItemResponseDTO } from './community-trip-item.dto';

export interface ListCommunityTripsResponseDTO {
  trips: CommunityTripItemResponseDTO[];
  total: number;
}
