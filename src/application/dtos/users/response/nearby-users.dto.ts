import { UserWithDetails } from './user-card.dto';

export interface NearbyUsersResponseDTO {
  users: UserWithDetails[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  isFallback: boolean;
  fallbackScope?: 'state' | 'country' | 'global';
  fallbackRegion?: string | null;
  radiusKm?: number;
}
