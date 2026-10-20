export interface BuddyUpcomingTripDTO {
  tripId: string;
  tripName: string;
  destination: {
    id: string;
    name: string;
    city: string | null;
    state: string | null;
    country: string | null;
    coverUrl: string | null;
  };
  dateFrom: Date;
  dateTo: Date;
  travelStyle: string;
  budgetStyle: string;
  buddy: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
    coverUrl: string | null;
    age: number | null;
    city: string | null;
    state: string | null;
    country: string | null;
    travelPersonality: string | null;
  };
}

export interface GetBuddiesUpcomingTripsResponseDTO {
  trips: BuddyUpcomingTripDTO[];
}
