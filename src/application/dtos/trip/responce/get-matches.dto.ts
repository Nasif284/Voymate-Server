export type ConnectionStatus =
  | 'CONNECTED'
  | 'REQUEST_SENT'
  | 'REQUEST_RECEIVED'
  | 'NONE';

export interface TripMatch {
  mode?: 'TRIP' | 'PROFILE' | 'SEARCH';
  connectionStatus?: ConnectionStatus;
  requestId?: string;
  forTrip?: {
    id: string;
    name: string;
  };
  forTripName?: string;
  user: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
    coverUrl: string | null;
    age: number | null;
    city: string | null;
    country: string | null;
    state: string | null;
    travelPersonality: string | null;
    interests: string[];
  };
  tripMatch: {
    id: string;
    matchedTripId: string;
    totalPoints?: number | null;
    dateFrom: Date;
    dateTo: Date;
    destination: string;
    mode?: 'TRIP' | 'PROFILE' | 'SEARCH';
    connectionStatus?: ConnectionStatus;
    requestId?: string;
    forTrip?: {
      id: string;
      name: string;
    };
    forTripName?: string;
  };
}

export interface TripMatchResponseDTO {
  buddiesOnRoad?: TripMatch[];
  matches: TripMatch[];
  limit: number;
  page: number;
  total: number;
  totalPages: number;
}
