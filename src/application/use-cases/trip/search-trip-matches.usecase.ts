import { inject, injectable } from 'tsyringe';
import {
  ISearchTripMatches,
  SearchTripMatchesRequestDTO,
} from '../../interfaces/use-cases/trip/search-trip-matches.interface';
import {
  TripMatch,
  TripMatchResponseDTO,
} from '../../dtos/trip/responce/get-matches.dto';
import { TOKENS } from '../../../infrastructure/di/tokens';
import { ITripRepository } from '../../interfaces/repositories/trip.repository';
import { IUserRepository } from '../../interfaces/repositories/user.reposetory';
import { IStorageService } from '../../interfaces/services/storage.service.interface';
import {
  IMatchingEngine,
  SearchTripMatchQuery,
  TripMatchingData,
} from '../../interfaces/services/matching-engine.service.interface';
import { calculateAge } from '../../../shared/helpers/calculateAge';
import { ICacheService } from '../../interfaces/services/cache.service.interface';

@injectable()
export class SearchTripMatches implements ISearchTripMatches {
  constructor(
    @inject(TOKENS.ITripRepository)
    private readonly _tripRepository: ITripRepository,
    @inject(TOKENS.IUserRepository)
    private readonly _userRepository: IUserRepository,
    @inject(TOKENS.IStorageService)
    private readonly _storageService: IStorageService,
    @inject(TOKENS.IMatchingEngine)
    private readonly _matchingEngine: IMatchingEngine,
    @inject(TOKENS.ICacheService)
    private readonly _cacheService: ICacheService,
  ) {}

  async execute(
    dto: SearchTripMatchesRequestDTO,
  ): Promise<TripMatchResponseDTO> {
    const page = dto.page && dto.page > 0 ? dto.page : 1;
    const limit = dto.limit && dto.limit > 0 ? dto.limit : 6;

    // 1. Fetch current viewing user profile
    const currentUser = await this._userRepository.getUserWithDetails(
      dto.userId,
    );
    if (!currentUser) {
      return {
        matches: [],
        page,
        limit,
        total: 0,
        totalPages: 0,
      };
    }

    const searchQuery: SearchTripMatchQuery = {
      destinationName: dto.destinationName,
      city: dto.city,
      state: dto.state,
      countryCode: dto.countryCode,
      dateFrom: dto.dateFrom ? new Date(dto.dateFrom) : undefined,
      dateTo: dto.dateTo ? new Date(dto.dateTo) : undefined,
      travelStyle: dto.travelStyle,
      budgetStyle: dto.budgetStyle,
      currentUser: {
        id: currentUser.id,
        fullName: currentUser.fullName,
        avatarUrl: currentUser.avatarUrl,
        coverUrl: currentUser.coverUrl,
        travelPersonality: currentUser.travelPersonality,
        travelType: currentUser.travelType,
        interests: currentUser.interests || [],
        languages: currentUser.languages || [],
        city: currentUser.city,
        state: currentUser.state,
        countryCode: currentUser.country,
        bio: currentUser.bio,
      },
    };

    // 2. Fetch candidate platform trips with SQL-level search filtering
    const candidateTrips =
      await this._tripRepository.getCandidateTripsForMatching(
        undefined,
        dto.userId,
        {
          destinationName: dto.destinationName,
          city: dto.city,
          state: dto.state,
          countryCode: dto.countryCode,
          dateFrom: dto.dateFrom,
          dateTo: dto.dateTo,
          travelStyle: dto.travelStyle,
          budgetStyle: dto.budgetStyle,
          limit: 100,
        },
      );

    const hasSearchFilters = Boolean(
      dto.destinationName?.trim() ||
      dto.city?.trim() ||
      dto.state?.trim() ||
      dto.countryCode?.trim() ||
      dto.dateFrom ||
      dto.dateTo ||
      dto.travelStyle ||
      dto.budgetStyle,
    );

    // 3. Process candidate trips (score only if search filters were applied)
    const processedTrips = candidateTrips.map((trip) => {
      if (!hasSearchFilters) {
        return {
          trip,
          searchResult: null,
        };
      }

      const tripData: TripMatchingData = {
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
          bio: trip.creator.bio,
        },
      };

      const searchResult = this._matchingEngine.scoreSearchMatch(
        searchQuery,
        tripData,
      );

      return {
        trip,
        searchResult,
      };
    });

    if (hasSearchFilters) {
      // Search results: sorted by match score descending
      processedTrips.sort((a, b) => {
        const scoreA = a.searchResult?.totalScore ?? 0;
        const scoreB = b.searchResult?.totalScore ?? 0;
        if (scoreB !== scoreA) {
          return scoreB - scoreA;
        }
        return (
          new Date(a.trip.dateFrom).getTime() -
          new Date(b.trip.dateFrom).getTime()
        );
      });
    } else {
      // "All Available Trips Looking for Companions": sorted purely by dateFrom ascending (earliest trip first)
      processedTrips.sort((a, b) => {
        return (
          new Date(a.trip.dateFrom).getTime() -
          new Date(b.trip.dateFrom).getTime()
        );
      });
    }

    // Extract buddies on the road
    const buddiesOnRoadCandidates = processedTrips.filter((m) => {
      if (m.trip.connectionStatus !== 'CONNECTED') return false;
      if (hasSearchFilters) {
        return (m.searchResult?.totalScore ?? 0) >= 25;
      }
      return true;
    });

    const buddiesOnRoad: TripMatch[] = await Promise.all(
      buddiesOnRoadCandidates.map(async ({ trip, searchResult }) => {
        const signedAvatar = trip.creator.avatarUrl
          ? await this._storageService.getSignedUrl(trip.creator.avatarUrl)
          : null;
        const signedCover = trip.creator.coverUrl
          ? await this._storageService.getSignedUrl(trip.creator.coverUrl)
          : null;

        return {
          mode: 'SEARCH' as const,
          connectionStatus: trip.connectionStatus,
          requestId: trip.requestId,
          user: {
            id: trip.creator.id,
            fullName: trip.creator.fullName,
            avatarUrl: signedAvatar,
            coverUrl: signedCover,
            age: trip.creator.dateOfBirth
              ? calculateAge(trip.creator.dateOfBirth)
              : null,
            city: trip.creator.city,
            state: trip.creator.state,
            country: trip.creator.country,
            travelPersonality: trip.creator.travelPersonality,
            interests: trip.creator.interests,
          },
          tripMatch: {
            id: trip.id,
            matchedTripId: trip.id,
            totalPoints: hasSearchFilters
              ? (searchResult?.totalScore ?? 0)
              : null,
            dateFrom: trip.dateFrom,
            dateTo: trip.dateTo,
            destination: trip.destinationName,
            mode: 'SEARCH' as const,
            connectionStatus: trip.connectionStatus,
            requestId: trip.requestId,
          },
        };
      }),
    );

    // 5. Paginate results
    const total = processedTrips.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedItems = processedTrips.slice(startIndex, startIndex + limit);

    // 6. Snapshot cards in Redis & sign assets (only snapshot if search filters are active)
    const matches: TripMatch[] = await Promise.all(
      paginatedItems.map(async ({ trip, searchResult }) => {
        if (hasSearchFilters && searchResult) {
          const cacheKey = `match:${dto.userId}:trip:${trip.id}`;
          await this._cacheService.set(
            cacheKey,
            1800,
            JSON.stringify({
              totalScore: searchResult.totalScore,
              reasons: searchResult.reasons,
            }),
          );
        }

        const signedAvatar = trip.creator.avatarUrl
          ? await this._storageService.getSignedUrl(trip.creator.avatarUrl)
          : null;
        const signedCover = trip.creator.coverUrl
          ? await this._storageService.getSignedUrl(trip.creator.coverUrl)
          : null;

        return {
          mode: 'SEARCH' as const,
          connectionStatus: trip.connectionStatus,
          requestId: trip.requestId,
          user: {
            id: trip.creator.id,
            fullName: trip.creator.fullName,
            avatarUrl: signedAvatar,
            coverUrl: signedCover,
            age: trip.creator.dateOfBirth
              ? calculateAge(trip.creator.dateOfBirth)
              : null,
            city: trip.creator.city,
            state: trip.creator.state,
            country: trip.creator.country,
            travelPersonality: trip.creator.travelPersonality,
            interests: trip.creator.interests,
          },
          tripMatch: {
            id: trip.id,
            matchedTripId: trip.id,
            totalPoints: hasSearchFilters
              ? (searchResult?.totalScore ?? 0)
              : null,
            dateFrom: trip.dateFrom,
            dateTo: trip.dateTo,
            destination: trip.destinationName,
            mode: 'SEARCH' as const,
            connectionStatus: trip.connectionStatus,
            requestId: trip.requestId,
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
}
