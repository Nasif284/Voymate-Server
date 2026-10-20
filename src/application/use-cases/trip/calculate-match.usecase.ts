import { inject, injectable } from 'tsyringe';
import { ICalculateMatch } from '../../interfaces/use-cases/trip/calculate-match.interface';
import { TOKENS } from '../../../infrastructure/di/tokens';
import { ITripRepository } from '../../interfaces/repositories/trip.repository';
@injectable()
export class CalculateMatch implements ICalculateMatch {
  constructor(
    @inject(TOKENS.ITripRepository)
    private readonly _tripRepository: ITripRepository,
  ) {}
  async execute(dto: { tripId: string; userId: string }): Promise<void> {
    const sourceTrip = await this._tripRepository.getTripForMatching(
      dto.tripId,
    );
    const candidateTrips = await this._tripRepository.getCandidateTrips(
      dto.tripId,
      dto.userId,
    );
    if (!candidateTrips) {
      return;
    }
    for (const targetTrip of candidateTrips) {
      let destinationScore = 0;
      let dateScore = 0;

      const reasons: string[] = [];

      if (sourceTrip.destinationId === targetTrip.destinationId) {
        destinationScore = 35;

        reasons.push(`Both traveling to ${sourceTrip.destination.name}`);
      } else if (
        sourceTrip.destination.state &&
        sourceTrip.destination.state === targetTrip.destination.state
      ) {
        destinationScore = 30;
        reasons.push(`Both traveling to ${sourceTrip.destination.state}`);
      } else if (
        sourceTrip.destination.country === targetTrip.destination.country
      ) {
        destinationScore = 10;
        reasons.push(`Both traveling to ${sourceTrip.destination.country}`);
      }

      const overlapStart = Math.max(
        new Date(sourceTrip.dateFrom).getTime(),

        new Date(targetTrip.dateFrom).getTime(),
      );

      const overlapEnd = Math.min(
        new Date(sourceTrip.dateTo).getTime(),

        new Date(targetTrip.dateTo).getTime(),
      );

      if (overlapEnd > overlapStart) {
        const overlapDays = (overlapEnd - overlapStart) / (1000 * 60 * 60 * 24);

        const tripDays =
          (new Date(sourceTrip.dateTo).getTime() -
            new Date(sourceTrip.dateFrom).getTime()) /
          (1000 * 60 * 60 * 24);

        dateScore = Math.round((overlapDays / tripDays) * 20);

        reasons.push(`Trip dates overlap for ${Math.round(overlapDays)} days`);
      }

      type TravelStyleCode = 'ADVENTURE' | 'CULTURAL' | 'LEISURE';
      type TravelStyles = {
        ADVENTURE: number;
        CULTURAL: number;
        LEISURE: number;
      };
      const styleMatrix: Record<TravelStyleCode, TravelStyles> = {
        ADVENTURE: {
          ADVENTURE: 10,
          CULTURAL: 6,
          LEISURE: 3,
        },
        CULTURAL: {
          ADVENTURE: 6,
          CULTURAL: 10,
          LEISURE: 6,
        },
        LEISURE: {
          ADVENTURE: 3,
          CULTURAL: 6,
          LEISURE: 10,
        },
      };

      const sourceStyle = (sourceTrip.travelStyleCode?.toUpperCase() ??
        '') as TravelStyleCode;
      const targetStyle = (targetTrip.travelStyleCode?.toUpperCase() ??
        '') as TravelStyleCode;
      const travelStyleScore = styleMatrix[sourceStyle]?.[targetStyle] ?? 0;

      if (travelStyleScore >= 8) {
        reasons.push(`Both prefer ${sourceTrip.travelStyleCode} travel`);
      }

      type BudgetStyleCode = 'BUDGET' | 'MODERATE' | 'PREMIUM' | 'LUXURY';
      type BudgetStyles = {
        BUDGET: number;
        MODERATE: number;
        PREMIUM: number;
        LUXURY: number;
      };
      const budgetMatrix: Record<BudgetStyleCode, BudgetStyles> = {
        BUDGET: {
          BUDGET: 10,
          MODERATE: 8,
          PREMIUM: 4,
          LUXURY: 0,
        },

        MODERATE: {
          BUDGET: 8,
          MODERATE: 10,
          PREMIUM: 8,
          LUXURY: 4,
        },

        PREMIUM: {
          BUDGET: 4,
          MODERATE: 8,
          PREMIUM: 10,
          LUXURY: 8,
        },

        LUXURY: {
          BUDGET: 0,
          MODERATE: 4,
          PREMIUM: 8,
          LUXURY: 10,
        },
      };

      const sourceBudget = (sourceTrip.budgetStyleCode?.toUpperCase() ??
        '') as BudgetStyleCode;
      const targetBudget = (targetTrip.budgetStyleCode?.toUpperCase() ??
        '') as BudgetStyleCode;
      const budgetScore = budgetMatrix[sourceBudget]?.[targetBudget] ?? 0;

      type PersonalityCode = 'INTROVERT' | 'AMBIVERT' | 'EXTROVERT';

      type Personalities = {
        INTROVERT: number;
        AMBIVERT: number;
        EXTROVERT: number;
      };

      const personalityMatrix: Record<PersonalityCode, Personalities> = {
        INTROVERT: {
          INTROVERT: 15,
          AMBIVERT: 10,
          EXTROVERT: 5,
        },

        AMBIVERT: {
          INTROVERT: 10,
          AMBIVERT: 15,
          EXTROVERT: 10,
        },

        EXTROVERT: {
          INTROVERT: 5,
          AMBIVERT: 10,
          EXTROVERT: 15,
        },
      };

      const sourcePersonality =
        (sourceTrip.creator.travelPersonalityCode?.toUpperCase() ??
          '') as PersonalityCode;
      const targetPersonality =
        (targetTrip.creator.travelPersonalityCode?.toUpperCase() ??
          '') as PersonalityCode;
      const personalityScore =
        personalityMatrix[sourcePersonality]?.[targetPersonality] ?? 0;

      const sourceInterests = sourceTrip.creator.interests.map(
        (i) => i.interestCode,
      );

      const candidateInterests = targetTrip.creator.interests.map(
        (i) => i.interestCode,
      );

      const sharedInterests = sourceInterests.filter((interest: string) =>
        candidateInterests.includes(interest),
      );

      const similarity =
        sharedInterests.length /
        Math.max(sourceInterests.length, candidateInterests.length);

      const interestScore = Math.round(similarity * 10);

      if (sharedInterests.length > 0) {
        reasons.push(`Shared interests: ${sharedInterests.join(', ')}`);
      }

      const sourceLanguages = sourceTrip.creator.languages.map(
        (l) => l.languageCode,
      );

      const targetLanguages = targetTrip.creator.languages.map(
        (l) => l.languageCode,
      );

      const sharedLanguages = sourceLanguages.filter((lang) =>
        targetLanguages.includes(lang),
      );

      const languageSimilarity =
        sharedLanguages.length /
        Math.max(sourceLanguages.length, targetLanguages.length);

      const languageScore = Math.round(languageSimilarity * 10);

      if (sharedLanguages.length) {
        reasons.push(`Common languages: ${sharedLanguages.join(', ')}`);
      }

      const totalScore =
        destinationScore +
        dateScore +
        travelStyleScore +
        budgetScore +
        personalityScore +
        interestScore;
      if (totalScore >= 70) {
        await this._tripRepository.saveTripMatch({
          budgetScore,
          dateScore,
          destinationScore,
          explanation: {
            reasons,
          },
          interestScore,
          languageScore,
          personalityScore,
          totalScore,
          travelStyleScore,
          sourceTripId: sourceTrip.id,
          targetTripId: targetTrip.id,
        });
      }
    }
  }
}
