export interface GetMatchProfileResponseDTO {
  connectionStatus?: 'CONNECTED' | 'REQUEST_SENT' | 'REQUEST_RECEIVED' | 'NONE';
  connectionId?: string | null;
  requestId?: string | null;
  user: {
    id: string;
    fullName: string;
    bio: string | null;
    avatarUrl: string | null;
    coverUrl: string | null;
    age: number | null;
    city: string | null;
    state: string | null;
    country: string | null;
    travelType: string | null;
    travelPersonality: string | null;
    interests: string[];
    skills: string[];
    languages: string[];
    createdAt: Date;
    connectionStatus?:
      | 'CONNECTED'
      | 'REQUEST_SENT'
      | 'REQUEST_RECEIVED'
      | 'NONE';
    connectionId?: string | null;
    requestId?: string | null;
  };
  match: {
    id: string;
    totalPoints: number;
    explanation: MatchExplanation;
  };
  matchedTrip: {
    id: string;
    name: string;
    dateFrom: Date;
    dateTo: Date;
    destination: {
      id: string;
      name: string;
      city: string | null;
      state: string | null;
      country: string;
      coverUrl: string | null;
    };
    budgetStyle: string;
    travelStyle: string;
  };
}

export interface MatchExplanation {
  reasons: string[];
}
