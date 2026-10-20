import { injectable } from 'tsyringe';
import {
  IMatchingEngine,
  SearchTripMatchQuery,
  SearchTripMatchResult,
  TripMatchingData,
  TripMatchResult,
  UserMatchingProfile,
} from '../../application/interfaces/services/matching-engine.service.interface';

@injectable()
export class MatchingEngine implements IMatchingEngine {
  // ─── Style & Personality Matrices ───────────────────────────────────────
  private readonly _styleMatrix: Record<string, Record<string, number>> = {
    ADVENTURE: { ADVENTURE: 10, CULTURAL: 6, LEISURE: 3 },
    CULTURAL: { ADVENTURE: 6, CULTURAL: 10, LEISURE: 6 },
    LEISURE: { ADVENTURE: 3, CULTURAL: 6, LEISURE: 10 },
  };

  private readonly _budgetMatrix: Record<string, Record<string, number>> = {
    BUDGET: { BUDGET: 10, MODERATE: 8, PREMIUM: 4, LUXURY: 0 },
    MODERATE: { BUDGET: 8, MODERATE: 10, PREMIUM: 8, LUXURY: 4 },
    PREMIUM: { BUDGET: 4, MODERATE: 8, PREMIUM: 10, LUXURY: 8 },
    LUXURY: { BUDGET: 0, MODERATE: 4, PREMIUM: 8, LUXURY: 10 },
  };

  private readonly _personalityMatrixTrip: Record<
    string,
    Record<string, number>
  > = {
    INTROVERT: { INTROVERT: 15, AMBIVERT: 12, EXTROVERT: 7 },
    AMBIVERT: { INTROVERT: 12, AMBIVERT: 15, EXTROVERT: 12 },
    EXTROVERT: { INTROVERT: 7, AMBIVERT: 12, EXTROVERT: 15 },
  };

  // ─── 1. Trip-to-Trip Matching (50% Logistics + 50% User Vibe) ───────────
  scoreTripMatch(
    sourceTrip: TripMatchingData,
    targetTrip: TripMatchingData,
  ): TripMatchResult {
    const reasons: string[] = [];

    // ── Logistics: Destination (Max 30)
    let destinationScore = 0;
    if (
      sourceTrip.destinationId &&
      targetTrip.destinationId &&
      sourceTrip.destinationId === targetTrip.destinationId
    ) {
      destinationScore = 30;
      reasons.push(`Both traveling to ${sourceTrip.destinationName}`);
    } else if (
      sourceTrip.destinationState &&
      targetTrip.destinationState &&
      sourceTrip.destinationState.toLowerCase() ===
        targetTrip.destinationState.toLowerCase()
    ) {
      destinationScore = 20;
      reasons.push(`Both heading to ${sourceTrip.destinationState}`);
    } else if (
      sourceTrip.destinationCountryCode &&
      targetTrip.destinationCountryCode &&
      sourceTrip.destinationCountryCode.toLowerCase() ===
        targetTrip.destinationCountryCode.toLowerCase()
    ) {
      destinationScore = 10;
      reasons.push(
        `Both traveling in ${sourceTrip.destinationCountryName || sourceTrip.destinationCountryCode}`,
      );
    }

    // ── Logistics: Dates Overlap (Max 20)
    let dateScore = 0;
    const overlapStart = Math.max(
      new Date(sourceTrip.dateFrom).getTime(),
      new Date(targetTrip.dateFrom).getTime(),
    );
    const overlapEnd = Math.min(
      new Date(sourceTrip.dateTo).getTime(),
      new Date(targetTrip.dateTo).getTime(),
    );

    if (overlapEnd > overlapStart) {
      const overlapDays = Math.ceil(
        (overlapEnd - overlapStart) / (1000 * 60 * 60 * 24),
      );
      const sourceDays = Math.max(
        1,
        Math.ceil(
          (new Date(sourceTrip.dateTo).getTime() -
            new Date(sourceTrip.dateFrom).getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      );
      dateScore = Math.min(20, Math.round((overlapDays / sourceDays) * 20));
      reasons.push(
        `Dates overlap for ${overlapDays} day${overlapDays > 1 ? 's' : ''}`,
      );
    }

    const logisticsScore = destinationScore + dateScore;

    // ── Vibe: Travel Style (Max 10)
    const sStyle = (sourceTrip.travelStyle || '').toUpperCase();
    const tStyle = (targetTrip.travelStyle || '').toUpperCase();
    const travelStyleScore = this._styleMatrix[sStyle]?.[tStyle] ?? 5;
    if (travelStyleScore >= 8) {
      reasons.push(
        `Both prefer ${sourceTrip.travelStyle.toLowerCase()} travel`,
      );
    }

    // ── Vibe: Budget Style (Max 10)
    const sBudget = (sourceTrip.budgetStyle || '').toUpperCase();
    const tBudget = (targetTrip.budgetStyle || '').toUpperCase();
    const budgetScore = this._budgetMatrix[sBudget]?.[tBudget] ?? 5;
    if (budgetScore >= 8) {
      reasons.push(
        `Similar ${sourceTrip.budgetStyle.toLowerCase()} budget preference`,
      );
    }

    // ── Vibe: Personality (Max 15)
    const sPers = (sourceTrip.creator.travelPersonality || '').toUpperCase();
    const tPers = (targetTrip.creator.travelPersonality || '').toUpperCase();
    const personalityScore = this._personalityMatrixTrip[sPers]?.[tPers] ?? 10;
    if (personalityScore >= 12 && sPers && tPers) {
      reasons.push(
        `Compatible travel personalities (${sourceTrip.creator.travelPersonality?.toLowerCase()})`,
      );
    }

    // ── Vibe: Shared Interests (Max 10)
    const { similarity: interestSim, shared: sharedInterests } =
      this._calculateSimilarity(
        sourceTrip.creator.interests,
        targetTrip.creator.interests,
      );
    const interestScore = Math.round(interestSim * 10);
    if (sharedInterests.length > 0) {
      reasons.push(
        `Shared interests: ${sharedInterests.slice(0, 3).join(', ')}`,
      );
    }

    // ── Vibe: Common Languages (Max 5)
    const { shared: sharedLanguages } = this._calculateSimilarity(
      sourceTrip.creator.languages,
      targetTrip.creator.languages,
    );
    const languageScore = sharedLanguages.length > 0 ? 5 : 0;
    if (sharedLanguages.length > 0) {
      reasons.push(`Common language: ${sharedLanguages[0]}`);
    }

    const vibeScore =
      travelStyleScore +
      budgetScore +
      personalityScore +
      interestScore +
      languageScore;
    const totalScore = Math.min(100, Math.max(0, logisticsScore + vibeScore));

    return {
      candidateTrip: targetTrip,
      totalScore,
      logisticsScore,
      vibeScore,
      destinationScore,
      dateScore,
      personalityScore,
      travelStyleScore,
      budgetScore,
      interestScore,
      languageScore,
      reasons,
    };
  }

  // ─── 2. Ad-hoc Search Matching (Search Query vs Candidate Trip) ──────────
  scoreSearchMatch(
    query: SearchTripMatchQuery,
    targetTrip: TripMatchingData,
  ): SearchTripMatchResult {
    const reasons: string[] = [];

    // ── Logistics: Destination (Max 30)
    let destinationScore = 0;
    if (query.destinationName && targetTrip.destinationName) {
      const qDest = query.destinationName.toLowerCase();
      const tDest = targetTrip.destinationName.toLowerCase();
      if (tDest.includes(qDest) || qDest.includes(tDest)) {
        destinationScore = 30;
        reasons.push(`Heading to ${targetTrip.destinationName}`);
      }
    }

    if (destinationScore === 0 && query.state && targetTrip.destinationState) {
      if (
        query.state.toLowerCase() === targetTrip.destinationState.toLowerCase()
      ) {
        destinationScore = 20;
        reasons.push(`Traveling to ${targetTrip.destinationState}`);
      }
    }

    if (
      destinationScore === 0 &&
      query.countryCode &&
      targetTrip.destinationCountryCode
    ) {
      if (
        query.countryCode.toLowerCase() ===
        targetTrip.destinationCountryCode.toLowerCase()
      ) {
        destinationScore = 10;
        reasons.push(
          `Traveling in ${targetTrip.destinationCountryName || targetTrip.destinationCountryCode}`,
        );
      }
    }

    // ── Logistics: Dates Overlap (Max 20)
    let dateScore = 0;
    if (query.dateFrom && query.dateTo) {
      const overlapStart = Math.max(
        new Date(query.dateFrom).getTime(),
        new Date(targetTrip.dateFrom).getTime(),
      );
      const overlapEnd = Math.min(
        new Date(query.dateTo).getTime(),
        new Date(targetTrip.dateTo).getTime(),
      );

      if (overlapEnd > overlapStart) {
        const overlapDays = Math.ceil(
          (overlapEnd - overlapStart) / (1000 * 60 * 60 * 24),
        );
        const queryDays = Math.max(
          1,
          Math.ceil(
            (new Date(query.dateTo).getTime() -
              new Date(query.dateFrom).getTime()) /
              (1000 * 60 * 60 * 24),
          ),
        );
        dateScore = Math.min(20, Math.round((overlapDays / queryDays) * 20));
        reasons.push(
          `Dates align for ${overlapDays} day${overlapDays > 1 ? 's' : ''}`,
        );
      }
    } else {
      // Flexible dates searched: award partial baseline
      dateScore = 15;
      reasons.push(
        `Upcoming trip on ${new Date(targetTrip.dateFrom).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      );
    }

    const logisticsScore = destinationScore + dateScore;

    // ── Vibe: Travel Style (Max 10)
    const desiredStyle = (
      query.travelStyle ||
      query.currentUser.travelType ||
      ''
    ).toUpperCase();
    const tStyle = (targetTrip.travelStyle || '').toUpperCase();
    const travelStyleScore = this._styleMatrix[desiredStyle]?.[tStyle] ?? 5;
    if (travelStyleScore >= 8 && desiredStyle) {
      reasons.push(
        `Matches desired ${desiredStyle.toLowerCase()} travel style`,
      );
    }

    // ── Vibe: Budget Style (Max 10)
    const desiredBudget = (query.budgetStyle || '').toUpperCase();
    const tBudget = (targetTrip.budgetStyle || '').toUpperCase();
    const budgetScore = desiredBudget
      ? (this._budgetMatrix[desiredBudget]?.[tBudget] ?? 5)
      : 8;
    if (budgetScore >= 8 && desiredBudget) {
      reasons.push(`Compatible ${tBudget.toLowerCase()} budget`);
    }

    // ── Vibe: Personality (Max 15)
    const sPers = (query.currentUser.travelPersonality || '').toUpperCase();
    const tPers = (targetTrip.creator.travelPersonality || '').toUpperCase();
    const personalityScore = this._personalityMatrixTrip[sPers]?.[tPers] ?? 10;

    // ── Vibe: Shared Interests (Max 10)
    const { similarity: interestSim, shared: sharedInterests } =
      this._calculateSimilarity(
        query.currentUser.interests,
        targetTrip.creator.interests,
      );
    const interestScore = Math.round(interestSim * 10);
    if (sharedInterests.length > 0) {
      reasons.push(
        `Shared interests: ${sharedInterests.slice(0, 3).join(', ')}`,
      );
    }

    // ── Vibe: Common Languages (Max 5)
    const { shared: sharedLanguages } = this._calculateSimilarity(
      query.currentUser.languages,
      targetTrip.creator.languages,
    );
    const languageScore = sharedLanguages.length > 0 ? 5 : 0;

    const vibeScore =
      travelStyleScore +
      budgetScore +
      personalityScore +
      interestScore +
      languageScore;
    const totalScore = Math.min(100, Math.max(0, logisticsScore + vibeScore));

    return {
      candidateTrip: targetTrip,
      totalScore,
      logisticsScore,
      vibeScore,
      destinationScore,
      dateScore,
      personalityScore,
      travelStyleScore,
      budgetScore,
      interestScore,
      languageScore,
      reasons,
    };
  }

  // ─── Helper: Set Similarity (Jaccard) ──────────────────────────────────
  private _calculateSimilarity(
    listA?: string[] | null,
    listB?: string[] | null,
  ): { similarity: number; shared: string[] } {
    if (!listA || !listB || listA.length === 0 || listB.length === 0) {
      return { similarity: 0, shared: [] };
    }

    const setB = new Set(listB.map((item) => item.trim().toLowerCase()));
    const shared: string[] = [];

    for (const item of listA) {
      const clean = item.trim().toLowerCase();
      if (setB.has(clean) && !shared.includes(item)) {
        shared.push(item);
      }
    }

    const maxLen = Math.max(listA.length, listB.length);
    const similarity = maxLen > 0 ? shared.length / maxLen : 0;

    return { similarity, shared };
  }
}
