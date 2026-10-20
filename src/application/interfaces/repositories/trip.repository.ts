import { BuddyUpcomingTripDTO } from '../../dtos/trip/responce/get-buddies-upcoming-trips.dto';
import { CreateTripDataDTO } from '../../dtos/trip/request/create-trip.dto';
import {
  CreateDestinationRequestDTO,
  Destination,
} from '../../dtos/trip/request/destination.dto';
import { EditTripData } from '../../dtos/trip/request/edit-trip.dto';
import {
  SaveTripMatchDTO,
  TripForMatchingDTO,
} from '../../dtos/trip/responce/calculate-mathc.dto';
import { GetActiveTripResponseDTO } from '../../dtos/trip/responce/get-active-trip.dto';
import { GetMatchProfileResponseDTO } from '../../dtos/trip/responce/get-match-profile.dto';
import { TripMatchResponseDTO } from '../../dtos/trip/responce/get-matches.dto';
import { GetUserTripsResponseDTO } from '../../dtos/trip/responce/get-user-trips.dto';

export interface ITripRepository {
  findDestinationByPlaceId(placeId: string): Promise<Destination | null>;
  createDestination(payload: CreateDestinationRequestDTO): Promise<Destination>;
  createTrip(payload: CreateTripDataDTO): Promise<{ tripId: string }>;
  getTripForMatching(tripId: string): Promise<TripForMatchingDTO>;
  getCandidateTrips(
    tripId: string,
    userId: string,
  ): Promise<TripForMatchingDTO[]>;
  saveTripMatch(payload: SaveTripMatchDTO): Promise<void>;
  deleteTripMatch(payload: { tripId: string }): Promise<void>;
  getTripMatches(
    tripId: string,
    page: number,
    limit: number,
  ): Promise<TripMatchResponseDTO>;
  getActiveTrip(payload: {
    userId: string;
  }): Promise<GetActiveTripResponseDTO | null>;
  getUserUpcomingTrips(payload: {
    userId: string;
  }): Promise<GetUserTripsResponseDTO>;
  getMatchProfile(payload: {
    matchId: string;
    userId: string;
  }): Promise<GetMatchProfileResponseDTO>;
  getUserPastTrips(payload: {
    userId: string;
  }): Promise<GetUserTripsResponseDTO>;
  editTrip(tripId: string, payload: EditTripData): Promise<void>;
  getDetailedTrip(tripId: string): Promise<CandidateTripDetail | null>;
  getCandidateTripsForMatching(
    tripId: string | null | undefined,
    userId: string,
    filterCriteria?: CandidateTripFilterCriteria,
  ): Promise<CandidateTripDetail[]>;
  getUserDetailedUpcomingTrips(userId: string): Promise<CandidateTripDetail[]>;
  getBuddiesUpcomingTrips(userId: string): Promise<BuddyUpcomingTripDTO[]>;
}

export interface TargetTripCriteria {
  dateFrom: Date;
  dateTo: Date;
  destinationId?: string;
  destinationCountryCode?: string | null;
  destinationState?: string | null;
}

export interface CandidateTripFilterCriteria {
  targetTrips?: TargetTripCriteria[];
  destinationName?: string;
  city?: string;
  state?: string;
  countryCode?: string;
  dateFrom?: Date;
  dateTo?: Date;
  travelStyle?: string;
  budgetStyle?: string;
  limit?: number;
}

export interface CandidateTripDetail {
  id: string;
  name: string;
  destinationId: string;
  destinationName: string;
  destinationCity: string | null;
  destinationState: string | null;
  destinationCountryCode: string;
  destinationCountryName: string | null;
  destinationLat: number;
  destinationLng: number;
  coverUrl: string | null;
  dateFrom: Date;
  dateTo: Date;
  budgetStyle: string;
  travelStyle: string;
  connectionStatus: 'CONNECTED' | 'REQUEST_SENT' | 'REQUEST_RECEIVED' | 'NONE';
  requestId?: string;
  creator: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
    coverUrl: string | null;
    bio: string | null;
    dateOfBirth: Date | null;
    city: string | null;
    state: string | null;
    country: string | null;
    countryCode: string | null;
    travelPersonality: string | null;
    travelType: string | null;
    interests: string[];
    languages: string[];
    skills: string[];
    createdAt: Date;
  };
}
