import { injectable } from 'tsyringe';
import {
  IMatchingEngine,
  SearchTripMatchQuery,
  SearchTripMatchResult,
  TripMatchingData,
  TripMatchResult,
} from '../../application/interfaces/services/matching-engine.service.interface';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

@injectable()
export class MatchingEngine implements IMatchingEngine {
  // ─── Vibe Matrices (Total Vibe Max = 35 pts) ────────────────────────────
  // Travel Style: Max 8 pts
  private readonly _styleMatrix: Record<string, Record<string, number>> = {
    ADVENTURE: { ADVENTURE: 8, CULTURAL: 5, LEISURE: 2 },
    CULTURAL: { ADVENTURE: 5, CULTURAL: 8, LEISURE: 5 },
    LEISURE: { ADVENTURE: 2, CULTURAL: 5, LEISURE: 8 },
  };

  // Budget Style: Max 7 pts
  private readonly _budgetMatrix: Record<string, Record<string, number>> = {
    BUDGET: { BUDGET: 7, MODERATE: 5, PREMIUM: 2, LUXURY: 0 },
    MODERATE: { BUDGET: 5, MODERATE: 7, PREMIUM: 5, LUXURY: 2 },
    PREMIUM: { BUDGET: 2, MODERATE: 5, PREMIUM: 7, LUXURY: 5 },
    LUXURY: { BUDGET: 0, MODERATE: 2, PREMIUM: 5, LUXURY: 7 },
  };

  // Personality: Max 10 pts
  private readonly _personalityMatrixTrip: Record<
    string,
    Record<string, number>
  > = {
    INTROVERT: { INTROVERT: 10, AMBIVERT: 8, EXTROVERT: 4 },
    AMBIVERT: { INTROVERT: 8, AMBIVERT: 10, EXTROVERT: 8 },
    EXTROVERT: { INTROVERT: 4, AMBIVERT: 8, EXTROVERT: 10 },
  };

  // ─── 1. Trip-to-Trip Matching (65% Logistics + 35% Vibe = 100 pts) ──────
  scoreTripMatch(
    sourceTrip: TripMatchingData,
    targetTrip: TripMatchingData,
  ): TripMatchResult {
    const reasons: string[] = [];

    // ── Logistics 1: Destination Proximity (Max 40 pts)
    const { score: destinationScore, reason: destReason } =
      this._scoreDestinationMatch(sourceTrip, targetTrip);
    if (destReason) {
      reasons.push(destReason);
    }

    // ── Logistics 2: Two-Way Date Overlap + Schedule Precision (Max 25 pts)
    const { score: dateScore, reason: dateReason } = this._scoreDateOverlap(
      sourceTrip.dateFrom,
      sourceTrip.dateTo,
      targetTrip.dateFrom,
      targetTrip.dateTo,
    );
    if (dateReason) {
      reasons.push(dateReason);
    }

    const logisticsScore = destinationScore + dateScore;

    // ── Vibe 1: Travel Style (Max 8 pts)
    const sStyle = (sourceTrip.travelStyle || '').toUpperCase();
    const tStyle = (targetTrip.travelStyle || '').toUpperCase();
    const travelStyleScore = this._styleMatrix[sStyle]?.[tStyle] ?? 4;
    if (travelStyleScore >= 7 && sourceTrip.travelStyle) {
      reasons.push(
        `Both prefer ${sourceTrip.travelStyle.toLowerCase()} travel`,
      );
    }

    // ── Vibe 2: Budget Style (Max 7 pts)
    const sBudget = (sourceTrip.budgetStyle || '').toUpperCase();
    const tBudget = (targetTrip.budgetStyle || '').toUpperCase();
    const budgetScore = this._budgetMatrix[sBudget]?.[tBudget] ?? 4;
    if (budgetScore >= 5 && sourceTrip.budgetStyle) {
      reasons.push(
        `Compatible ${sourceTrip.budgetStyle.toLowerCase()} budget preference`,
      );
    }

    // ── Vibe 3: Personality (Max 10 pts)
    const sPers = (sourceTrip.creator.travelPersonality || '').toUpperCase();
    const tPers = (targetTrip.creator.travelPersonality || '').toUpperCase();
    const personalityScore = this._personalityMatrixTrip[sPers]?.[tPers] ?? 6;
    if (personalityScore >= 8 && sPers && tPers) {
      reasons.push(
        `Compatible travel personalities (${sourceTrip.creator.travelPersonality?.toLowerCase()})`,
      );
    }

    // ── Vibe 4: Shared Interests (Max 6 pts)
    const { similarity: interestSim, shared: sharedInterests } =
      this._calculateSimilarity(
        sourceTrip.creator.interests,
        targetTrip.creator.interests,
      );
    const interestScore = Math.round(interestSim * 6);
    if (sharedInterests.length > 0) {
      reasons.push(
        `Shared interests: ${sharedInterests.slice(0, 3).join(', ')}`,
      );
    }

    // ── Vibe 5: Common Languages (Max 4 pts)
    const { shared: sharedLanguages } = this._calculateSimilarity(
      sourceTrip.creator.languages,
      targetTrip.creator.languages,
    );
    const languageScore = sharedLanguages.length > 0 ? 4 : 0;
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

  // ─── 2. Ad-hoc Search Matching (65% Logistics + 35% Vibe = 100 pts) ─────
  scoreSearchMatch(
    query: SearchTripMatchQuery,
    targetTrip: TripMatchingData,
  ): SearchTripMatchResult {
    const reasons: string[] = [];

    // ── Logistics 1: Destination (Max 40 pts)
    let destinationScore = 0;
    if (query.destinationName && targetTrip.destinationName) {
      if (
        this._isSamePlaceName(
          query.destinationName,
          query.city,
          targetTrip.destinationName,
          targetTrip.destinationCity,
        )
      ) {
        destinationScore = 40;
        reasons.push(
          `Heading to ${this._formatShortDestination(targetTrip.destinationName)}`,
        );
      }
    }

    if (destinationScore === 0 && query.city && targetTrip.destinationCity) {
      if (
        query.city.trim().toLowerCase() ===
        targetTrip.destinationCity.trim().toLowerCase()
      ) {
        destinationScore = 40;
        reasons.push(`Heading to ${targetTrip.destinationCity}`);
      }
    }

    if (destinationScore === 0 && query.state && targetTrip.destinationState) {
      if (
        query.state.trim().toLowerCase() ===
        targetTrip.destinationState.trim().toLowerCase()
      ) {
        destinationScore = 15;
        reasons.push(`Traveling in ${targetTrip.destinationState}`);
      }
    }

    if (
      destinationScore === 0 &&
      query.countryCode &&
      targetTrip.destinationCountryCode
    ) {
      if (
        query.countryCode.trim().toLowerCase() ===
        targetTrip.destinationCountryCode.trim().toLowerCase()
      ) {
        destinationScore = 5;
        reasons.push(
          `Traveling in ${targetTrip.destinationCountryName || targetTrip.destinationCountryCode}`,
        );
      }
    }

    // ── Logistics 2: Dates Overlap (Max 25 pts)
    let dateScore: number;
    if (query.dateFrom && query.dateTo) {
      const { score, reason } = this._scoreDateOverlap(
        query.dateFrom,
        query.dateTo,
        targetTrip.dateFrom,
        targetTrip.dateTo,
      );
      dateScore = score;
      if (reason) {
        reasons.push(reason);
      }
    } else {
      // Flexible dates searched: award partial baseline
      dateScore = 18;
      reasons.push(
        `Upcoming trip starting ${new Date(targetTrip.dateFrom).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      );
    }

    const logisticsScore = destinationScore + dateScore;

    // ── Vibe 1: Travel Style (Max 8 pts)
    const desiredStyle = (
      query.travelStyle ||
      query.currentUser.travelType ||
      ''
    ).toUpperCase();
    const tStyle = (targetTrip.travelStyle || '').toUpperCase();
    const travelStyleScore = this._styleMatrix[desiredStyle]?.[tStyle] ?? 4;
    if (travelStyleScore >= 7 && desiredStyle) {
      reasons.push(
        `Matches desired ${desiredStyle.toLowerCase()} travel style`,
      );
    }

    // ── Vibe 2: Budget Style (Max 7 pts)
    const desiredBudget = (query.budgetStyle || '').toUpperCase();
    const tBudget = (targetTrip.budgetStyle || '').toUpperCase();
    const budgetScore = desiredBudget
      ? (this._budgetMatrix[desiredBudget]?.[tBudget] ?? 4)
      : 5;
    if (budgetScore >= 5 && desiredBudget) {
      reasons.push(`Compatible ${tBudget.toLowerCase()} budget`);
    }

    // ── Vibe 3: Personality (Max 10 pts)
    const sPers = (query.currentUser.travelPersonality || '').toUpperCase();
    const tPers = (targetTrip.creator.travelPersonality || '').toUpperCase();
    const personalityScore = this._personalityMatrixTrip[sPers]?.[tPers] ?? 6;

    // ── Vibe 4: Shared Interests (Max 6 pts)
    const { similarity: interestSim, shared: sharedInterests } =
      this._calculateSimilarity(
        query.currentUser.interests,
        targetTrip.creator.interests,
      );
    const interestScore = Math.round(interestSim * 6);
    if (sharedInterests.length > 0) {
      reasons.push(
        `Shared interests: ${sharedInterests.slice(0, 3).join(', ')}`,
      );
    }

    // ── Vibe 5: Common Languages (Max 4 pts)
    const { shared: sharedLanguages } = this._calculateSimilarity(
      query.currentUser.languages,
      targetTrip.creator.languages,
    );
    const languageScore = sharedLanguages.length > 0 ? 4 : 0;

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

  // ─── Helper: Multi-Signal Destination Scoring (Max 40 pts) ──────────────
  private _scoreDestinationMatch(
    sourceTrip: TripMatchingData,
    targetTrip: TripMatchingData,
  ): { score: number; reason: string | null } {
    const shortTargetName = this._formatShortDestination(
      targetTrip.destinationName,
    );

    // 1. Exact destination ID match
    if (
      sourceTrip.destinationId &&
      targetTrip.destinationId &&
      sourceTrip.destinationId === targetTrip.destinationId
    ) {
      return {
        score: 40,
        reason: `Both traveling to ${shortTargetName}`,
      };
    }

    // 2. Normalized place name / city match (handles different Google Place IDs for the same place, e.g. "Spiti Valley" vs "Spiti Valley, Marango Rangarik")
    if (
      this._isSamePlaceName(
        sourceTrip.destinationName,
        sourceTrip.destinationCity,
        targetTrip.destinationName,
        targetTrip.destinationCity,
      )
    ) {
      return {
        score: 40,
        reason: `Both traveling to ${this._formatShortDestination(sourceTrip.destinationName)}`,
      };
    }

    // 3. Haversine GPS distance check
    const distanceKm = this._calculateDistanceKm(
      sourceTrip.destinationLat,
      sourceTrip.destinationLng,
      targetTrip.destinationLat,
      targetTrip.destinationLng,
    );

    if (distanceKm !== null) {
      if (distanceKm <= 25) {
        return {
          score: 40,
          reason: `Both traveling to ${shortTargetName}`,
        };
      }
      if (distanceKm <= 80) {
        return {
          score: 28,
          reason: `Traveling to nearby ${shortTargetName} (~${Math.round(distanceKm)} km away)`,
        };
      }
    }

    // 4. Same State / Region (> 80 km apart, e.g. Spiti Valley vs Manali/Chitkul in Himachal Pradesh)
    if (
      sourceTrip.destinationState &&
      targetTrip.destinationState &&
      sourceTrip.destinationState.trim().toLowerCase() ===
        targetTrip.destinationState.trim().toLowerCase()
    ) {
      return {
        score: 15,
        reason: `Both traveling in ${sourceTrip.destinationState}`,
      };
    }

    // 5. Same Country
    if (
      sourceTrip.destinationCountryCode &&
      targetTrip.destinationCountryCode &&
      sourceTrip.destinationCountryCode.trim().toLowerCase() ===
        targetTrip.destinationCountryCode.trim().toLowerCase()
    ) {
      return {
        score: 5,
        reason: `Both traveling in ${sourceTrip.destinationCountryName || sourceTrip.destinationCountryCode}`,
      };
    }

    return { score: 0, reason: null };
  }

  // ─── Helper: Two-Way Date Overlap + Schedule Precision (Max 25 pts) ─────
  private _scoreDateOverlap(
    sourceFrom: Date | string,
    sourceTo: Date | string,
    targetFrom: Date | string,
    targetTo: Date | string,
  ): { score: number; reason: string | null } {
    const sStart = this._toUtcMidnightMs(sourceFrom);
    const sEnd = Math.max(sStart, this._toUtcMidnightMs(sourceTo));
    const tStart = this._toUtcMidnightMs(targetFrom);
    const tEnd = Math.max(tStart, this._toUtcMidnightMs(targetTo));

    const overlapStart = Math.max(sStart, tStart);
    const overlapEnd = Math.min(sEnd, tEnd);

    if (overlapEnd < overlapStart) {
      return { score: 0, reason: null };
    }

    const overlapDays =
      Math.round((overlapEnd - overlapStart) / MS_PER_DAY) + 1;
    const sourceDays = Math.max(
      1,
      Math.round((sEnd - sStart) / MS_PER_DAY) + 1,
    );
    const unionStart = Math.min(sStart, tStart);
    const unionEnd = Math.max(sEnd, tEnd);
    const unionDays = Math.max(
      1,
      Math.round((unionEnd - unionStart) / MS_PER_DAY) + 1,
    );

    // Coverage of viewer's trip: up to 20 pts
    const coverageRatio = Math.min(1, overlapDays / sourceDays);
    const coverageScore = Math.round(coverageRatio * 20);

    // Schedule precision bonus (rewards exact start/end alignment): up to 5 pts
    const jaccardRatio = Math.min(1, overlapDays / unionDays);
    const precisionBonus = Math.round(jaccardRatio * 5);

    const score = Math.min(25, coverageScore + precisionBonus);

    const isExactMatch = sStart === tStart && sEnd === tEnd;
    const reason = isExactMatch
      ? `Exact same travel dates (${overlapDays} day${overlapDays > 1 ? 's' : ''})`
      : `Dates overlap for ${overlapDays} day${overlapDays > 1 ? 's' : ''}`;

    return { score, reason };
  }

  private _toUtcMidnightMs(dateInput: Date | string): number {
    const d = new Date(dateInput);
    return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  }

  private _formatShortDestination(name?: string | null): string {
    if (!name) return 'this destination';
    return name.split(',')[0].trim() || name;
  }

  private _normalizePlaceToken(val?: string | null): string {
    if (!val) return '';
    return val
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private _isSamePlaceName(
    sourceName?: string | null,
    sourceCity?: string | null,
    targetName?: string | null,
    targetCity?: string | null,
  ): boolean {
    const sPrimary = this._normalizePlaceToken(sourceName?.split(',')[0]);
    const tPrimary = this._normalizePlaceToken(targetName?.split(',')[0]);
    const sCity = this._normalizePlaceToken(sourceCity);
    const tCity = this._normalizePlaceToken(targetCity);

    if (sPrimary && tPrimary && sPrimary === tPrimary) {
      return true;
    }

    if (sCity && tCity && sCity === tCity) {
      return true;
    }

    if (sPrimary && tCity && sPrimary === tCity) {
      return true;
    }

    if (tPrimary && sCity && tPrimary === sCity) {
      return true;
    }

    const sSegments = (sourceName || '')
      .split(',')
      .map((seg) => this._normalizePlaceToken(seg))
      .filter((seg) => seg.length >= 3);
    const tSegments = (targetName || '')
      .split(',')
      .map((seg) => this._normalizePlaceToken(seg))
      .filter((seg) => seg.length >= 3);

    if (sPrimary.length >= 3 && tSegments.includes(sPrimary)) {
      return true;
    }

    if (tPrimary.length >= 3 && sSegments.includes(tPrimary)) {
      return true;
    }

    return false;
  }

  private _calculateDistanceKm(
    lat1?: number | null,
    lng1?: number | null,
    lat2?: number | null,
    lng2?: number | null,
  ): number | null {
    if (
      lat1 === null ||
      lat1 === undefined ||
      lng1 === null ||
      lng1 === undefined ||
      lat2 === null ||
      lat2 === undefined ||
      lng2 === null ||
      lng2 === undefined
    ) {
      return null;
    }

    const nLat1 = Number(lat1);
    const nLng1 = Number(lng1);
    const nLat2 = Number(lat2);
    const nLng2 = Number(lng2);

    if (
      !Number.isFinite(nLat1) ||
      !Number.isFinite(nLng1) ||
      !Number.isFinite(nLat2) ||
      !Number.isFinite(nLng2) ||
      (nLat1 === 0 && nLng1 === 0) ||
      (nLat2 === 0 && nLng2 === 0)
    ) {
      return null;
    }

    const R = 6371; // Earth radius in km
    const dLat = ((nLat2 - nLat1) * Math.PI) / 180;
    const dLng = ((nLng2 - nLng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((nLat1 * Math.PI) / 180) *
        Math.cos((nLat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
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
