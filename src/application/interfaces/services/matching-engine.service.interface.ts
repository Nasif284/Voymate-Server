export interface UserMatchingProfile {
  id: string;
  fullName: string;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  travelPersonality?: string | null; // INTROVERT | AMBIVERT | EXTROVERT
  travelType?: string | null; // ADVENTURE | CULTURAL | LEISURE | SOLO | LUXURY | BUDGET etc.
  interests: string[]; // e.g. ["hiking", "photography", "food"]
  languages: string[]; // e.g. ["English", "Malayalam", "Hindi"]
  city?: string | null;
  state?: string | null;
  countryCode?: string | null;
  countryName?: string | null;
  currentLat?: number | null;
  currentLng?: number | null;
  bio?: string | null;
  age?: number | null;
}

export interface TripMatchingData {
  id: string;
  name: string;
  destinationId: string;
  destinationName: string;
  destinationCity?: string | null;
  destinationState?: string | null;
  destinationCountryCode: string;
  destinationCountryName?: string | null;
  destinationLat: number;
  destinationLng: number;
  coverUrl?: string | null;
  dateFrom: Date;
  dateTo: Date;
  budgetStyle: string;
  travelStyle: string;
  creator: UserMatchingProfile;
}

export interface SearchTripMatchQuery {
  destinationName?: string;
  city?: string;
  state?: string;
  countryCode?: string;
  countryName?: string;
  dateFrom?: Date;
  dateTo?: Date;
  budgetStyle?: string;
  travelStyle?: string;
  currentUser: UserMatchingProfile;
}

export interface TripMatchResult {
  candidateTrip: TripMatchingData;
  totalScore: number;
  logisticsScore: number;
  vibeScore: number;
  destinationScore: number;
  dateScore: number;
  personalityScore: number;
  travelStyleScore: number;
  budgetScore: number;
  interestScore: number;
  languageScore: number;
  reasons: string[];
}

export interface SearchTripMatchResult {
  candidateTrip: TripMatchingData;
  totalScore: number;
  logisticsScore: number;
  vibeScore: number;
  destinationScore: number;
  dateScore: number;
  personalityScore: number;
  travelStyleScore: number;
  budgetScore: number;
  interestScore: number;
  languageScore: number;
  reasons: string[];
}

export interface IMatchingEngine {
  scoreTripMatch(
    sourceTrip: TripMatchingData,
    targetTrip: TripMatchingData,
  ): TripMatchResult;
  scoreSearchMatch(
    query: SearchTripMatchQuery,
    targetTrip: TripMatchingData,
  ): SearchTripMatchResult;
}
