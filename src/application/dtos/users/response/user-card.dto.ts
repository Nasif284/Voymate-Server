export interface UserActiveTripDTO {
  id: string;
  name: string;
  destination: string;
  destinationCity?: string | null;
  destinationState?: string | null;
  destinationCountry?: string | null;
  dateFrom: Date | string;
  dateTo: Date | string;
  travelStyle?: string | null;
  budgetStyle?: string | null;
}

export interface UserWithDetails {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  coverUrl: string | null;
  age: number | null;
  city: string | null;
  state?: string | null;
  country: string | null;
  travelType: string | null;
  travelPersonality: string | null;
  interests: string[];
  distanceKm?: number;
  isTraveling?: boolean;
  matchScore?: number;
  reasons?: string[];
  activeTrip?: UserActiveTripDTO | null;
}
export interface UserCardDetailsResponseDTO {
  users: UserWithDetails[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
