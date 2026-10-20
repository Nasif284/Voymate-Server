import { inject, injectable } from 'tsyringe';
import { IGetMatchProfile } from '../../interfaces/use-cases/trip/get-match-profile.interface';
import { TOKENS } from '../../../infrastructure/di/tokens';
import { ITripRepository } from '../../interfaces/repositories/trip.repository';
import { IUserRepository } from '../../interfaces/repositories/user.reposetory';
import { GetMatchProfileResponseDTO } from '../../dtos/trip/responce/get-match-profile.dto';
import { IStorageService } from '../../interfaces/services/storage.service.interface';
import {
  IMatchingEngine,
  TripMatchingData,
} from '../../interfaces/services/matching-engine.service.interface';
import { calculateAge } from '../../../shared/helpers/calculateAge';
import { ICacheService } from '../../interfaces/services/cache.service.interface';

@injectable()
export class GetMatchProfile implements IGetMatchProfile {
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

  async execute(dto: {
    matchId: string;
    userId: string;
  }): Promise<GetMatchProfileResponseDTO> {
    // 1. Fetch the target matched trip directly by its ID
    const targetTrip = await this._tripRepository.getDetailedTrip(dto.matchId);
    if (!targetTrip) {
      throw new Error('Matched trip not found');
    }

    const cacheKey = `match:${dto.userId}:trip:${dto.matchId}`;
    const cached = await this._cacheService.get(cacheKey);

    let totalScore: number;
    let reasons: string[];

    if (cached) {
      // Cache HIT: Instant return with exact card snapshot (< 1ms)
      const parsed = JSON.parse(cached);
      totalScore = parsed.totalScore;
      reasons = parsed.reasons;
    } else {
      // Cache MISS or TTL Expired: Dynamic recalculation via MatchingEngine
      const userTrips = await this._tripRepository.getUserDetailedUpcomingTrips(
        dto.userId,
      );

      if (userTrips.length > 0) {
        const targetData: TripMatchingData = {
          id: targetTrip.id,
          name: targetTrip.name,
          destinationId: targetTrip.destinationId,
          destinationName: targetTrip.destinationName,
          destinationCity: targetTrip.destinationCity,
          destinationState: targetTrip.destinationState,
          destinationCountryCode: targetTrip.destinationCountryCode,
          destinationCountryName: targetTrip.destinationCountryName,
          destinationLat: targetTrip.destinationLat,
          destinationLng: targetTrip.destinationLng,
          coverUrl: targetTrip.coverUrl,
          dateFrom: targetTrip.dateFrom,
          dateTo: targetTrip.dateTo,
          budgetStyle: targetTrip.budgetStyle,
          travelStyle: targetTrip.travelStyle,
          creator: {
            id: targetTrip.creator.id,
            fullName: targetTrip.creator.fullName,
            avatarUrl: targetTrip.creator.avatarUrl,
            coverUrl: targetTrip.creator.coverUrl,
            travelPersonality: targetTrip.creator.travelPersonality,
            travelType: targetTrip.creator.travelType,
            interests: targetTrip.creator.interests,
            languages: targetTrip.creator.languages,
            city: targetTrip.creator.city,
            state: targetTrip.creator.state,
            countryCode: targetTrip.creator.countryCode,
            countryName: targetTrip.creator.country,
          },
        };

        let bestScore = -1;
        let bestReasons: string[] = [];

        for (const sourceTrip of userTrips) {
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

          const tripResult = this._matchingEngine.scoreTripMatch(
            sourceData,
            targetData,
          );
          if (tripResult.totalScore > bestScore) {
            bestScore = tripResult.totalScore;
            bestReasons = tripResult.reasons;
          }
        }

        totalScore = bestScore;
        reasons = bestReasons;
      } else {
        // Scenario B: Viewer has NO active trip (e.g. came through Search Mode without creating an upcoming trip)
        totalScore = 0;
        reasons = [
          'Create an upcoming trip to calculate compatibility score and shared dates with this traveler',
        ];
      }

      // Re-populate Redis cache for subsequent requests (TTL: 30 minutes)
      await this._cacheService.set(
        cacheKey,
        1800,
        JSON.stringify({ totalScore, reasons }),
      );
    }
    console.log(targetTrip);
    return {
      match: {
        id: targetTrip.id,
        totalPoints: totalScore,
        explanation: { reasons },
      },
      matchedTrip: {
        id: targetTrip.id,
        name: targetTrip.name,
        budgetStyle: targetTrip.budgetStyle,
        dateFrom: targetTrip.dateFrom,
        dateTo: targetTrip.dateTo,
        travelStyle: targetTrip.travelStyle,
        destination: {
          id: targetTrip.destinationId,
          name: targetTrip.destinationName,
          city: targetTrip.destinationCity,
          state: targetTrip.destinationState,
          country:
            targetTrip.destinationCountryName ||
            targetTrip.destinationCountryCode,
          coverUrl: targetTrip.coverUrl,
        },
      },
      user: {
        id: targetTrip.creator.id,
        fullName: targetTrip.creator.fullName,
        bio: targetTrip.creator.bio,
        avatarUrl: targetTrip.creator.avatarUrl
          ? await this._storageService.getSignedUrl(
              targetTrip.creator.avatarUrl,
            )
          : null,
        coverUrl: targetTrip.creator.coverUrl
          ? await this._storageService.getSignedUrl(targetTrip.creator.coverUrl)
          : null,
        age: targetTrip.creator.dateOfBirth
          ? calculateAge(targetTrip.creator.dateOfBirth)
          : null,
        city: targetTrip.creator.city,
        state: targetTrip.creator.state,
        country: targetTrip.creator.country,
        travelType: targetTrip.creator.travelType,
        travelPersonality: targetTrip.creator.travelPersonality,
        interests: targetTrip.creator.interests,
        skills: targetTrip.creator.skills,
        languages: targetTrip.creator.languages,
        createdAt: targetTrip.creator.createdAt,
      },
    };
  }
}
