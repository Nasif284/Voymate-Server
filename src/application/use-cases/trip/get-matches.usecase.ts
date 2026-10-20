import { inject, injectable } from 'tsyringe';
import { IGetTripMatches } from '../../interfaces/use-cases/trip/get-trip-matches.interface';
import { TOKENS } from '../../../infrastructure/di/tokens';
import { ITripRepository } from '../../interfaces/repositories/trip.repository';
import {
  TripMatch,
  TripMatchResponseDTO,
} from '../../dtos/trip/responce/get-matches.dto';
import { IStorageService } from '../../interfaces/services/storage.service.interface';
import {
  IMatchingEngine,
  TripMatchingData,
} from '../../interfaces/services/matching-engine.service.interface';
import { calculateAge } from '../../../shared/helpers/calculateAge';
import { ICacheService } from '../../interfaces/services/cache.service.interface';

@injectable()
export class GetTripMatches implements IGetTripMatches {
  constructor(
    @inject(TOKENS.ITripRepository)
    private readonly _tripRepository: ITripRepository,
    @inject(TOKENS.IStorageService)
    private readonly _storageService: IStorageService,
    @inject(TOKENS.IMatchingEngine)
    private readonly _matchingEngine: IMatchingEngine,
    @inject(TOKENS.ICacheService)
    private readonly _cacheService: ICacheService,
  ) {}

  async execute(dto: {
    tripId: string;
    page: number;
    limit: number;
  }): Promise<TripMatchResponseDTO> {
    const sourceTrip = await this._tripRepository.getDetailedTrip(dto.tripId);
    if (!sourceTrip) {
      return {
        matches: [],
        limit: dto.limit,
        page: dto.page,
        total: 0,
        totalPages: 1,
      };
    }

    const candidates = await this._tripRepository.getCandidateTripsForMatching(
      dto.tripId,
      sourceTrip.creator.id,
      {
        targetTrips: [
          {
            destinationId: sourceTrip.destinationId,
            dateFrom: sourceTrip.dateFrom,
            dateTo: sourceTrip.dateTo,
            destinationCountryCode: sourceTrip.destinationCountryCode,
            destinationState: sourceTrip.destinationState,
          },
        ],
        limit: 100,
      },
    );

    const sourceData: TripMatchingData = {
      id: sourceTrip.id,
      name: sourceTrip.name,
      destinationId: sourceTrip.destinationId,
      destinationName: sourceTrip.destinationName,
      destinationCity: sourceTrip.destinationCity,
      destinationState: sourceTrip.destinationState,
      destinationCountryCode: sourceTrip.destinationCountryCode,
      destinationCountryName: sourceTrip.destinationCountryName,
      destinationLat: sourceTrip.destinationLat,
      destinationLng: sourceTrip.destinationLng,
      coverUrl: sourceTrip.coverUrl,
      dateFrom: sourceTrip.dateFrom,
      dateTo: sourceTrip.dateTo,
      budgetStyle: sourceTrip.budgetStyle,
      travelStyle: sourceTrip.travelStyle,
      creator: {
        id: sourceTrip.creator.id,
        fullName: sourceTrip.creator.fullName,
        avatarUrl: sourceTrip.creator.avatarUrl,
        coverUrl: sourceTrip.creator.coverUrl,
        travelPersonality: sourceTrip.creator.travelPersonality,
        travelType: sourceTrip.creator.travelType,
        interests: sourceTrip.creator.interests,
        languages: sourceTrip.creator.languages,
        city: sourceTrip.creator.city,
        state: sourceTrip.creator.state,
        countryCode: sourceTrip.creator.countryCode,
        countryName: sourceTrip.creator.country,
      },
    };

    // Calculate on-the-fly scores for every candidate trip
    const scoredMatches = candidates.map((candidate) => {
      const candidateData: TripMatchingData = {
        id: candidate.id,
        name: candidate.name,
        destinationId: candidate.destinationId,
        destinationName: candidate.destinationName,
        destinationCity: candidate.destinationCity,
        destinationState: candidate.destinationState,
        destinationCountryCode: candidate.destinationCountryCode,
        destinationCountryName: candidate.destinationCountryName,
        destinationLat: candidate.destinationLat,
        destinationLng: candidate.destinationLng,
        coverUrl: candidate.coverUrl,
        dateFrom: candidate.dateFrom,
        dateTo: candidate.dateTo,
        budgetStyle: candidate.budgetStyle,
        travelStyle: candidate.travelStyle,
        creator: {
          id: candidate.creator.id,
          fullName: candidate.creator.fullName,
          avatarUrl: candidate.creator.avatarUrl,
          coverUrl: candidate.creator.coverUrl,
          travelPersonality: candidate.creator.travelPersonality,
          travelType: candidate.creator.travelType,
          interests: candidate.creator.interests,
          languages: candidate.creator.languages,
          city: candidate.creator.city,
          state: candidate.creator.state,
          countryCode: candidate.creator.countryCode,
          countryName: candidate.creator.country,
        },
      };

      const result = this._matchingEngine.scoreTripMatch(
        sourceData,
        candidateData,
      );
      return {
        candidate,
        result,
      };
    });

    // Extract buddies on the road (connected users with trip match score >= 25)
    const buddiesOnRoadCandidates = scoredMatches.filter(
      (m) =>
        m.candidate.connectionStatus === 'CONNECTED' &&
        m.result.totalScore >= 25,
    );

    const buddiesOnRoad: TripMatch[] = await Promise.all(
      buddiesOnRoadCandidates.map(async ({ candidate, result }) => {
        return {
          mode: 'TRIP' as const,
          connectionStatus: candidate.connectionStatus,
          requestId: candidate.requestId,
          user: {
            id: candidate.creator.id,
            fullName: candidate.creator.fullName,
            avatarUrl: candidate.creator.avatarUrl
              ? await this._storageService.getSignedUrl(
                  candidate.creator.avatarUrl,
                )
              : null,
            coverUrl: candidate.creator.coverUrl
              ? await this._storageService.getSignedUrl(
                  candidate.creator.coverUrl,
                )
              : null,
            age: candidate.creator.dateOfBirth
              ? calculateAge(candidate.creator.dateOfBirth)
              : null,
            city: candidate.creator.city,
            state: candidate.creator.state,
            country: candidate.creator.country,
            travelPersonality: candidate.creator.travelPersonality,
            interests: candidate.creator.interests,
          },
          tripMatch: {
            id: candidate.id,
            matchedTripId: candidate.id,
            totalPoints: result.totalScore,
            destination: candidate.destinationName,
            dateFrom: candidate.dateFrom,
            dateTo: candidate.dateTo,
            mode: 'TRIP' as const,
            connectionStatus: candidate.connectionStatus,
            requestId: candidate.requestId,
          },
        };
      }),
    );

    // Soft threshold: keep matches with score >= 25 (or all candidates if pool is small)
    const validMatches = scoredMatches.filter((m) => m.result.totalScore >= 25);

    // Rank candidates descending by totalScore
    validMatches.sort((a, b) => b.result.totalScore - a.result.totalScore);

    const total = validMatches.length;
    const totalPages = Math.ceil(total / dto.limit) || 1;
    const skip = (dto.page - 1) * dto.limit;
    const paginatedMatches = validMatches.slice(skip, skip + dto.limit);

    // Snapshot card scores in Redis for instant, guaranteed-consistent detail page loads (TTL: 30 mins)
    await Promise.all(
      paginatedMatches.map(async ({ candidate, result }) => {
        const cacheKey = `match:${sourceTrip.creator.id}:trip:${candidate.id}`;
        await this._cacheService.set(
          cacheKey,
          1800,
          JSON.stringify({
            totalScore: result.totalScore,
            reasons: result.reasons,
          }),
        );
      }),
    );

    const matches = await Promise.all(
      paginatedMatches.map(async ({ candidate, result }) => {
        return {
          mode: 'TRIP' as const,
          connectionStatus: candidate.connectionStatus,
          requestId: candidate.requestId,
          user: {
            id: candidate.creator.id,
            fullName: candidate.creator.fullName,
            avatarUrl: candidate.creator.avatarUrl
              ? await this._storageService.getSignedUrl(
                  candidate.creator.avatarUrl,
                )
              : null,
            coverUrl: candidate.creator.coverUrl
              ? await this._storageService.getSignedUrl(
                  candidate.creator.coverUrl,
                )
              : null,
            age: candidate.creator.dateOfBirth
              ? calculateAge(candidate.creator.dateOfBirth)
              : null,
            city: candidate.creator.city,
            state: candidate.creator.state,
            country: candidate.creator.country,
            travelPersonality: candidate.creator.travelPersonality,
            interests: candidate.creator.interests,
          },
          tripMatch: {
            id: candidate.id,
            matchedTripId: candidate.id,
            totalPoints: result.totalScore,
            destination: candidate.destinationName,
            dateFrom: candidate.dateFrom,
            dateTo: candidate.dateTo,
            mode: 'TRIP' as const,
            connectionStatus: candidate.connectionStatus,
            requestId: candidate.requestId,
          },
        };
      }),
    );

    return {
      buddiesOnRoad: buddiesOnRoad.length > 0 ? buddiesOnRoad : undefined,
      matches,
      limit: dto.limit,
      page: dto.page,
      total,
      totalPages,
    };
  }
}
