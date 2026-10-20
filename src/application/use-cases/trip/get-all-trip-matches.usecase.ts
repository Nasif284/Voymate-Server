import { inject, injectable } from 'tsyringe';
import { IGetAllTripMatches } from '../../interfaces/use-cases/trip/get-all-trip-matches.interface';
import { TOKENS } from '../../../infrastructure/di/tokens';
import {
  CandidateTripDetail,
  ITripRepository,
} from '../../interfaces/repositories/trip.repository';
import {
  TripMatch,
  TripMatchResponseDTO,
} from '../../dtos/trip/responce/get-matches.dto';
import { IStorageService } from '../../interfaces/services/storage.service.interface';
import {
  IMatchingEngine,
  TripMatchingData,
  TripMatchResult,
} from '../../interfaces/services/matching-engine.service.interface';
import { calculateAge } from '../../../shared/helpers/calculateAge';
import { ICacheService } from '../../interfaces/services/cache.service.interface';

interface ScoredCandidateMatch {
  candidate: CandidateTripDetail;
  bestMatch: {
    sourceTrip: CandidateTripDetail;
    result: TripMatchResult;
  };
}

@injectable()
export class GetAllTripMatches implements IGetAllTripMatches {
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
    userId: string;
    page?: number;
    limit?: number;
  }): Promise<TripMatchResponseDTO> {
    const page = dto.page && dto.page > 0 ? dto.page : 1;
    const limit = dto.limit && dto.limit > 0 ? dto.limit : 6;

    // 1. Fetch all upcoming trips of the authenticated user
    const userTrips = await this._tripRepository.getUserDetailedUpcomingTrips(
      dto.userId,
    );

    if (userTrips.length === 0) {
      return {
        matches: [],
        limit,
        page,
        total: 0,
        totalPages: 1,
      };
    }

    // 2. Fetch candidate trips from other active platform users with indexed SQL-level pruning
    const targetTrips = userTrips.map((t) => ({
      destinationId: t.destinationId,
      dateFrom: t.dateFrom,
      dateTo: t.dateTo,
      destinationCountryCode: t.destinationCountryCode,
      destinationState: t.destinationState,
    }));

    const candidates = await this._tripRepository.getCandidateTripsForMatching(
      null,
      dto.userId,
      {
        targetTrips,
        limit: 100,
      },
    );

    if (candidates.length === 0) {
      return {
        matches: [],
        limit,
        page,
        total: 0,
        totalPages: 1,
      };
    }

    // 3. Prepare user trip data models for the matching engine
    const userTripMatchingList = userTrips.map((trip) => ({
      rawTrip: trip,
      matchingData: this.mapToTripMatchingData(trip),
    }));

    // 4. Score each candidate trip against all user trips, finding the best match for each candidate
    const scoredMatches: ScoredCandidateMatch[] = [];

    for (const candidate of candidates) {
      const candidateData = this.mapToTripMatchingData(candidate);
      let bestMatch: {
        sourceTrip: CandidateTripDetail;
        result: TripMatchResult;
      } | null = null;

      for (const uTrip of userTripMatchingList) {
        const result = this._matchingEngine.scoreTripMatch(
          uTrip.matchingData,
          candidateData,
        );
        if (!bestMatch || result.totalScore > bestMatch.result.totalScore) {
          bestMatch = {
            sourceTrip: uTrip.rawTrip,
            result,
          };
        }
      }

      if (bestMatch && bestMatch.result.totalScore >= 25) {
        scoredMatches.push({
          candidate,
          bestMatch,
        });
      }
    }

    // 5. Deduplicate by candidate creator ID: if a candidate traveler created multiple trips,
    // keep the one with the highest compatibility score to ensure user diversity on the home feed.
    const userBestMap = new Map<string, ScoredCandidateMatch>();
    for (const match of scoredMatches) {
      const creatorId = match.candidate.creator.id;
      const existing = userBestMap.get(creatorId);
      if (
        !existing ||
        match.bestMatch.result.totalScore > existing.bestMatch.result.totalScore
      ) {
        userBestMap.set(creatorId, match);
      }
    }

    const deduplicatedMatches = Array.from(userBestMap.values());

    // 6. Extract "Buddies on the Road" (connected buddies with high score >= 25)
    const buddiesOnRoadCandidates = deduplicatedMatches.filter(
      (m) =>
        m.candidate.connectionStatus === 'CONNECTED' &&
        m.bestMatch.result.totalScore >= 25,
    );

    const buddiesOnRoad: TripMatch[] = await Promise.all(
      buddiesOnRoadCandidates.map(async ({ candidate, bestMatch }) => {
        const avatarUrl = candidate.creator.avatarUrl
          ? await this._storageService.getSignedUrl(candidate.creator.avatarUrl)
          : null;
        const coverUrl = candidate.creator.coverUrl
          ? await this._storageService.getSignedUrl(candidate.creator.coverUrl)
          : null;

        return {
          mode: 'TRIP' as const,
          connectionStatus: candidate.connectionStatus,
          requestId: candidate.requestId,
          forTrip: {
            id: bestMatch.sourceTrip.id,
            name: bestMatch.sourceTrip.name,
          },
          forTripName: bestMatch.sourceTrip.name,
          user: {
            id: candidate.creator.id,
            fullName: candidate.creator.fullName,
            avatarUrl,
            coverUrl,
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
            totalPoints: bestMatch.result.totalScore,
            destination: candidate.destinationName,
            dateFrom: candidate.dateFrom,
            dateTo: candidate.dateTo,
            mode: 'TRIP' as const,
            connectionStatus: candidate.connectionStatus,
            requestId: candidate.requestId,
            forTrip: {
              id: bestMatch.sourceTrip.id,
              name: bestMatch.sourceTrip.name,
            },
            forTripName: bestMatch.sourceTrip.name,
          },
        };
      }),
    );

    // 7. Sort all matches descending by totalScore
    deduplicatedMatches.sort(
      (a, b) => b.bestMatch.result.totalScore - a.bestMatch.result.totalScore,
    );

    const total = deduplicatedMatches.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const skip = (page - 1) * limit;
    const paginatedMatches = deduplicatedMatches.slice(skip, skip + limit);

    // 8. Snapshot card scores in Redis for instant, consistent detail view loads (TTL: 30 mins)
    await Promise.all(
      paginatedMatches.map(async ({ candidate, bestMatch }) => {
        const cacheKey = `match:${dto.userId}:trip:${candidate.id}`;
        await this._cacheService.set(
          cacheKey,
          1800,
          JSON.stringify({
            totalScore: bestMatch.result.totalScore,
            reasons: bestMatch.result.reasons,
          }),
        );
      }),
    );

    // 9. Format matches with signed media URLs and source trip annotations
    const matches: TripMatch[] = await Promise.all(
      paginatedMatches.map(async ({ candidate, bestMatch }) => {
        const avatarUrl = candidate.creator.avatarUrl
          ? await this._storageService.getSignedUrl(candidate.creator.avatarUrl)
          : null;
        const coverUrl = candidate.creator.coverUrl
          ? await this._storageService.getSignedUrl(candidate.creator.coverUrl)
          : null;

        return {
          mode: 'TRIP' as const,
          connectionStatus: candidate.connectionStatus,
          requestId: candidate.requestId,
          forTrip: {
            id: bestMatch.sourceTrip.id,
            name: bestMatch.sourceTrip.name,
          },
          forTripName: bestMatch.sourceTrip.name,
          user: {
            id: candidate.creator.id,
            fullName: candidate.creator.fullName,
            avatarUrl,
            coverUrl,
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
            totalPoints: bestMatch.result.totalScore,
            destination: candidate.destinationName,
            dateFrom: candidate.dateFrom,
            dateTo: candidate.dateTo,
            mode: 'TRIP' as const,
            connectionStatus: candidate.connectionStatus,
            requestId: candidate.requestId,
            forTrip: {
              id: bestMatch.sourceTrip.id,
              name: bestMatch.sourceTrip.name,
            },
            forTripName: bestMatch.sourceTrip.name,
          },
        };
      }),
    );

    return {
      buddiesOnRoad: buddiesOnRoad.length > 0 ? buddiesOnRoad : undefined,
      matches,
      limit,
      page,
      total,
      totalPages,
    };
  }

  private mapToTripMatchingData(trip: CandidateTripDetail): TripMatchingData {
    return {
      id: trip.id,
      name: trip.name,
      destinationId: trip.destinationId,
      destinationName: trip.destinationName,
      destinationCity: trip.destinationCity,
      destinationState: trip.destinationState,
      destinationCountryCode: trip.destinationCountryCode,
      destinationCountryName: trip.destinationCountryName,
      destinationLat: trip.destinationLat,
      destinationLng: trip.destinationLng,
      coverUrl: trip.coverUrl,
      dateFrom: trip.dateFrom,
      dateTo: trip.dateTo,
      budgetStyle: trip.budgetStyle,
      travelStyle: trip.travelStyle,
      creator: {
        id: trip.creator.id,
        fullName: trip.creator.fullName,
        avatarUrl: trip.creator.avatarUrl,
        coverUrl: trip.creator.coverUrl,
        travelPersonality: trip.creator.travelPersonality,
        travelType: trip.creator.travelType,
        interests: trip.creator.interests,
        languages: trip.creator.languages,
        city: trip.creator.city,
        state: trip.creator.state,
        countryCode: trip.creator.countryCode,
        countryName: trip.creator.country,
      },
    };
  }
}
