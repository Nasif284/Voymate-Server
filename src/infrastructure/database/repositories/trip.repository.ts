import { inject, injectable } from 'tsyringe';
import {
  Trip,
  Prisma,
  PrismaClient,
  BudgetStyle,
  TripStyle,
  TripStatus,
  ConnectionRequestStatus,
} from '@prisma/client';
import { BaseRepository } from './base.repository';
import { TOKENS } from '../../di/tokens';
import {
  ITripRepository,
  CandidateTripDetail,
  CandidateTripFilterCriteria,
} from '../../../application/interfaces/repositories/trip.repository';
import {
  CreateDestinationRequestDTO,
  Destination,
} from '../../../application/dtos/trip/request/destination.dto';
import { CreateTripDataDTO } from '../../../application/dtos/trip/request/create-trip.dto';
import {
  SaveTripMatchDTO,
  TripForMatchingDTO,
} from '../../../application/dtos/trip/responce/calculate-mathc.dto';
import { BuddyUpcomingTripDTO } from '../../../application/dtos/trip/responce/get-buddies-upcoming-trips.dto';
import { TripMatchResponseDTO } from '../../../application/dtos/trip/responce/get-matches.dto';
import { calculateAge } from '../../../shared/helpers/calculateAge';
import { GetActiveTripResponseDTO } from '../../../application/dtos/trip/responce/get-active-trip.dto';
import { GetUserTripsResponseDTO } from '../../../application/dtos/trip/responce/get-user-trips.dto';
import {
  GetMatchProfileResponseDTO,
  MatchExplanation,
} from '../../../application/dtos/trip/responce/get-match-profile.dto';
import { EditTripData } from '../../../application/dtos/trip/request/edit-trip.dto';

@injectable()
export class TripRepository
  extends BaseRepository<Trip, Prisma.TripCreateInput, Prisma.TripUpdateInput>
  implements ITripRepository
{
  constructor(@inject(TOKENS.PrismaClient) prisma: PrismaClient) {
    super(prisma, prisma.trip);
  }
  async findDestinationByPlaceId(placeId: string): Promise<Destination | null> {
    const result = await this.prisma.destination.findFirst({
      where: {
        placeId,
      },
    });
    if (!result) {
      return null;
    }
    return {
      ...result,
      latitude: Number(result?.latitude),
      longitude: Number(result?.longitude),
    };
  }
  async createTrip(payload: CreateTripDataDTO): Promise<{ tripId: string }> {
    const trip = await this.prisma.trip.create({
      data: {
        name: payload.name,
        dateFrom: payload.dateFrom,
        dateTo: payload.dateTo,
        destination: {
          connect: {
            id: payload.destinationId,
          },
        },
        creator: {
          connect: {
            id: payload.createdBy,
          },
        },
        budgetStyle: payload.budgetStyle.toUpperCase() as BudgetStyle,
        travelStyle: payload.travelStyleCode.toUpperCase() as TripStyle,
      },
    });

    return { tripId: trip.id };
  }
  async createDestination(
    payload: CreateDestinationRequestDTO,
  ): Promise<Destination> {
    const result = await this.prisma.destination.create({
      data: {
        ...payload,
      },
    });
    return {
      ...result,
      latitude: Number(result?.latitude),
      longitude: Number(result?.longitude),
    };
  }

  async getCandidateTrips(
    tripId: string,
    userId: string,
  ): Promise<TripForMatchingDTO[]> {
    const trips = await this.prisma.trip.findMany({
      where: {
        id: {
          not: tripId,
        },
        createdBy: {
          not: userId,
        },
        status: TripStatus.UPCOMING,
      },
      include: {
        destination: {
          include: {
            country: true,
          },
        },
        creator: {
          include: {
            interests: true,
            languages: true,
          },
        },
      },
    });
    return trips.map((trip) => ({
      id: trip.id,

      destinationId: trip.destinationId,

      dateFrom: trip.dateFrom,
      dateTo: trip.dateTo,

      budgetStyleCode: trip.budgetStyle,
      travelStyleCode: trip.travelStyle,

      destination: {
        id: trip.destination.id,
        name: trip.destination.name,
        city: trip.destination.city,
        state: trip.destination.state,
        country: trip.destination.country.name,
        latitude: Number(trip.destination.latitude),
        longitude: Number(trip.destination.longitude),
        coverUrl: trip.destination.coverUrl,
      },

      creator: {
        id: trip.creator.id,
        travelPersonalityCode: trip.creator.travelPersonality,
        interests: trip.creator.interests.map((interest) => ({
          interestCode: interest.interest,
        })),
        languages: trip.creator.languages.map((language) => ({
          languageCode: language.language,
        })),
      },
    }));
  }
  async getTripForMatching(tripId: string): Promise<TripForMatchingDTO> {
    const trip = await this.prisma.trip.findUnique({
      where: {
        id: tripId,
      },

      include: {
        destination: {
          include: {
            country: true,
          },
        },

        creator: {
          include: {
            interests: true,
            languages: true,
          },
        },
      },
    });

    if (!trip) {
      throw new Error('trip not found');
    }

    return {
      id: trip.id,

      destinationId: trip.destinationId,

      dateFrom: trip.dateFrom,
      dateTo: trip.dateTo,

      budgetStyleCode: trip.budgetStyle,
      travelStyleCode: trip.travelStyle,

      destination: {
        id: trip.destination.id,
        name: trip.destination.name,
        city: trip.destination.city,
        state: trip.destination.state,
        country: trip.destination.country.name,
        latitude: Number(trip.destination.latitude),
        longitude: Number(trip.destination.longitude),
        coverUrl: trip.destination.coverUrl,
      },

      creator: {
        id: trip.creator.id,
        travelPersonalityCode: trip.creator.travelPersonality,
        interests: trip.creator.interests.map((interest) => ({
          interestCode: interest.interest,
        })),
        languages: trip.creator.languages.map((language) => ({
          languageCode: language.language,
        })),
      },
    };
  }

  async saveTripMatch(payload: SaveTripMatchDTO): Promise<void> {
    await this.prisma.tripMatch.upsert({
      where: {
        tripAId_tripBId: {
          tripAId: payload.sourceTripId,
          tripBId: payload.targetTripId,
        },
      },
      create: {
        tripAId: payload.sourceTripId,
        tripBId: payload.targetTripId,
        destinationScore: payload.destinationScore,
        budgetScore: payload.budgetScore,
        dateScore: payload.dateScore,
        interestScore: payload.interestScore,
        languageScore: payload.languageScore,
        personalityScore: payload.personalityScore,
        travelStyleScore: payload.travelStyleScore,
        totalScore: payload.totalScore,
        explanation: payload.explanation,
      },
      update: {
        destinationScore: payload.destinationScore,
        dateScore: payload.dateScore,
        travelStyleScore: payload.travelStyleScore,
        budgetScore: payload.budgetScore,
        personalityScore: payload.personalityScore,
        interestScore: payload.interestScore,
        totalScore: payload.totalScore,
        explanation: payload.explanation,
        calculatedAt: new Date(),
      },
    });
  }

  async deleteTripMatch(payload: { tripId: string }): Promise<void> {
    await this.prisma.tripMatch.deleteMany({
      where: {
        OR: [{ tripAId: payload.tripId }, { tripBId: payload.tripId }],
      },
    });
  }

  async getTripMatches(
    tripId: string,
    page: number,
    limit: number,
  ): Promise<TripMatchResponseDTO> {
    const skip = (page - 1) * limit;
    const where = {
      OR: [
        {
          tripAId: tripId,
          tripB: {
            status: TripStatus.UPCOMING,
            dateTo: {
              gte: new Date(),
            },
          },
        },
        {
          tripBId: tripId,
          tripA: {
            status: TripStatus.UPCOMING,
            dateTo: {
              gte: new Date(),
            },
          },
        },
      ],

      connectionRequest: {
        none: {
          status: ConnectionRequestStatus.ACCEPTED,
        },
      },
    };
    const [matches, total] = await Promise.all([
      this.prisma.tripMatch.findMany({
        where,

        orderBy: {
          totalScore: 'desc',
        },

        skip,
        take: limit,

        include: {
          tripA: {
            include: {
              destination: true,

              creator: {
                include: {
                  interests: true,
                  languages: true,
                  country: true,
                },
              },
            },
          },

          tripB: {
            include: {
              destination: true,

              creator: {
                include: {
                  interests: true,
                  languages: true,
                  country: true,
                },
              },
            },
          },
        },
      }),

      this.prisma.tripMatch.count({
        where,
      }),
    ]);
    return {
      matches: matches.map((match) => {
        const matchedTrip =
          match.tripAId === tripId ? match.tripB : match.tripA;
        return {
          user: {
            id: matchedTrip.creator.id,
            fullName: matchedTrip.creator.fullName,
            age: calculateAge(matchedTrip.creator.dateOfBirth!),
            avatarUrl: matchedTrip.creator.avatarUrl,
            city: matchedTrip.creator.city,
            country: matchedTrip.creator.country?.name ?? null,
            state: matchedTrip.creator.state,
            coverUrl: matchedTrip.creator.coverUrl,
            interests: matchedTrip.creator.interests.map(
              (interest) => interest.interest,
            ),
            travelPersonality: matchedTrip.creator.travelPersonality,
          },
          tripMatch: {
            id: match.id,
            matchedTripId: matchedTrip.id,
            destination: matchedTrip.destination.name.split(',')[0],
            dateFrom: matchedTrip.dateFrom,
            dateTo: matchedTrip.dateTo,
            totalPoints: match.totalScore,
          },
        };
      }),
      limit,
      page,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getActiveTrip(payload: {
    userId: string;
  }): Promise<GetActiveTripResponseDTO | null> {
    const trip = await this.prisma.trip.findFirst({
      where: {
        createdBy: payload.userId,
        status: TripStatus.UPCOMING,
        dateTo: {
          gte: new Date(),
        },
      },
      orderBy: {
        dateFrom: 'asc',
      },
      include: {
        destination: {
          include: {
            country: true,
          },
        },
      },
    });
    if (!trip) {
      return null;
    }
    return {
      id: trip?.id,
      destinationId: trip.destinationId,
      name: trip.name,
      destination: {
        id: trip.destination.id,
        city: trip.destination.city,
        country: trip.destination.country.name,
        latitude: Number(trip.destination.latitude),
        longitude: Number(trip.destination.longitude),
        name: trip.destination.name,
        state: trip.destination.state,
        coverUrl: trip.destination.coverUrl,
      },
      budgetStyleCode: trip.budgetStyle,
      dateFrom: trip.dateFrom,
      dateTo: trip.dateTo,
      travelStyleCode: trip.travelStyle,
    };
  }

  async getUserUpcomingTrips(payload: {
    userId: string;
  }): Promise<GetUserTripsResponseDTO> {
    const trips = await this.prisma.trip.findMany({
      where: {
        createdBy: payload.userId,
        dateTo: {
          gte: new Date(),
        },
        status: { not: TripStatus.CANCELLED },
      },
      include: {
        destination: {
          include: {
            country: true,
          },
        },
      },
    });
    return {
      trips: trips.map((trip) => {
        return {
          id: trip.id,
          name: trip.name,
          dateFrom: trip.dateFrom,
          dateTo: trip.dateTo,
          destination: {
            id: trip.destination.id,
            city: trip.destination.city,
            country: trip.destination.country.name,
            latitude: Number(trip.destination.latitude),
            longitude: Number(trip.destination.longitude),
            name: trip.destination.name,
            state: trip.destination.state,
            coverUrl: trip.destination.coverUrl,
          },
          budgetStyleCode: trip.budgetStyle,
          destinationId: trip.destinationId,
          travelStyleCode: trip.travelStyle,
        };
      }),
    };
  }

  async getMatchProfile(payload: {
    matchId: string;
    userId: string;
  }): Promise<GetMatchProfileResponseDTO> {
    const targetTrip = await this.getDetailedTrip(payload.matchId);
    if (!targetTrip) {
      throw new Error('Matched trip not found');
    }

    const activeTrip = await this.getActiveTrip({ userId: payload.userId });
    let totalPoints = 75;
    const reasons: string[] = [];

    if (activeTrip) {
      if (
        activeTrip.destination.name.toLowerCase() ===
        targetTrip.destinationName.toLowerCase()
      ) {
        totalPoints += 15;
        reasons.push(`Both traveling to ${targetTrip.destinationName}`);
      } else if (
        activeTrip.destination.state &&
        targetTrip.destinationState &&
        activeTrip.destination.state.toLowerCase() ===
          targetTrip.destinationState.toLowerCase()
      ) {
        totalPoints += 10;
        reasons.push(`Both heading to ${targetTrip.destinationState}`);
      }
      reasons.push(
        `Compatible travel style (${targetTrip.travelStyle.toLowerCase()})`,
      );
    } else {
      reasons.push(`Compatible travel companion`);
    }

    if (targetTrip.creator.interests.length > 0) {
      reasons.push(
        `Interests: ${targetTrip.creator.interests.slice(0, 3).join(', ')}`,
      );
    }

    return {
      match: {
        id: targetTrip.id,
        explanation: { reasons },
        totalPoints: Math.min(100, totalPoints),
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
          coverUrl: targetTrip.coverUrl,
          city: targetTrip.destinationCity,
          country:
            targetTrip.destinationCountryName ||
            targetTrip.destinationCountryCode,
          state: targetTrip.destinationState,
        },
      },
      user: {
        id: targetTrip.creator.id,
        fullName: targetTrip.creator.fullName,
        age: targetTrip.creator.dateOfBirth
          ? calculateAge(targetTrip.creator.dateOfBirth)
          : null,
        avatarUrl: targetTrip.creator.avatarUrl,
        bio: targetTrip.creator.bio,
        city: targetTrip.creator.city,
        country: targetTrip.creator.country,
        coverUrl: targetTrip.creator.coverUrl,
        travelPersonality: targetTrip.creator.travelPersonality,
        travelType: targetTrip.creator.travelType,
        state: targetTrip.creator.state,
        createdAt: targetTrip.creator.createdAt,
        interests: targetTrip.creator.interests,
        languages: targetTrip.creator.languages,
        skills: targetTrip.creator.skills,
      },
    };
  }

  async getUserPastTrips(payload: {
    userId: string;
  }): Promise<GetUserTripsResponseDTO> {
    const trips = await this.prisma.trip.findMany({
      where: {
        createdBy: payload.userId,
        status: { not: TripStatus.CANCELLED },
        dateTo: {
          lt: new Date(),
        },
      },
      include: {
        destination: {
          include: {
            country: true,
          },
        },
      },
    });
    return {
      trips: trips.map((trip) => {
        return {
          id: trip.id,
          name: trip.name,
          dateFrom: trip.dateFrom,
          dateTo: trip.dateTo,
          destination: {
            id: trip.destination.id,
            city: trip.destination.city,
            country: trip.destination.country.name,
            latitude: Number(trip.destination.latitude),
            longitude: Number(trip.destination.longitude),
            name: trip.destination.name,
            state: trip.destination.state,
            coverUrl: trip.destination.coverUrl,
          },
          budgetStyleCode: trip.budgetStyle,
          destinationId: trip.destinationId,
          travelStyleCode: trip.travelStyle,
        };
      }),
    };
  }

  async editTrip(tripId: string, payload: EditTripData): Promise<void> {
    const data: Prisma.TripUpdateInput = {};
    if (payload.dateFrom) data.dateFrom = payload.dateFrom;
    if (payload.dateTo) data.dateTo = payload.dateTo;
    if (payload.budgetStyleCode)
      data.budgetStyle = payload.budgetStyleCode.toUpperCase() as BudgetStyle;
    if (payload.travelStyleCode)
      data.travelStyle = payload.travelStyleCode.toUpperCase() as TripStyle;
    if (payload.statusCode)
      data.status = payload.statusCode.toUpperCase() as TripStatus;

    await this.prisma.trip.update({
      where: {
        id: tripId,
      },
      data,
    });
  }

  async getDetailedTrip(tripId: string): Promise<CandidateTripDetail | null> {
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        destination: {
          include: {
            country: true,
          },
        },
        creator: {
          include: {
            interests: true,
            languages: true,
            skills: true,
            country: true,
          },
        },
      },
    });

    if (!trip) return null;

    return {
      id: trip.id,
      name: trip.name,
      destinationId: trip.destinationId,
      destinationName: trip.destination.name,
      destinationCity: trip.destination.city,
      destinationState: trip.destination.state,
      destinationCountryCode: trip.destination.countryCode,
      destinationCountryName: trip.destination.country.name,
      destinationLat: Number(trip.destination.latitude),
      destinationLng: Number(trip.destination.longitude),
      coverUrl: trip.destination.coverUrl,
      dateFrom: trip.dateFrom,
      dateTo: trip.dateTo,
      budgetStyle: trip.budgetStyle,
      travelStyle: trip.travelStyle,
      connectionStatus: 'NONE',
      creator: {
        id: trip.creator.id,
        fullName: trip.creator.fullName,
        avatarUrl: trip.creator.avatarUrl,
        coverUrl: trip.creator.coverUrl,
        bio: trip.creator.bio,
        dateOfBirth: trip.creator.dateOfBirth,
        city: trip.creator.city,
        state: trip.creator.state,
        country: trip.creator.country?.name ?? null,
        countryCode: trip.creator.countryCode,
        travelPersonality: trip.creator.travelPersonality,
        travelType: trip.creator.travelType,
        interests: trip.creator.interests.map((i) => i.interest),
        languages: trip.creator.languages.map((l) => l.language),
        skills: trip.creator.skills.map((s) => s.skill),
        createdAt: trip.creator.createdAt,
      },
    };
  }

  async getUserDetailedUpcomingTrips(
    userId: string,
  ): Promise<CandidateTripDetail[]> {
    const trips = await this.prisma.trip.findMany({
      where: {
        createdBy: userId,
        status: TripStatus.UPCOMING,
        dateTo: { gte: new Date() },
      },
      orderBy: {
        dateFrom: 'asc',
      },
      include: {
        destination: {
          include: {
            country: true,
          },
        },
        creator: {
          include: {
            interests: true,
            languages: true,
            skills: true,
            country: true,
          },
        },
      },
    });

    return trips.map((trip) => ({
      id: trip.id,
      name: trip.name,
      destinationId: trip.destinationId,
      destinationName: trip.destination.name,
      destinationCity: trip.destination.city,
      destinationState: trip.destination.state,
      destinationCountryCode: trip.destination.countryCode,
      destinationCountryName: trip.destination.country.name,
      destinationLat: Number(trip.destination.latitude),
      destinationLng: Number(trip.destination.longitude),
      coverUrl: trip.destination.coverUrl,
      dateFrom: trip.dateFrom,
      dateTo: trip.dateTo,
      budgetStyle: trip.budgetStyle,
      travelStyle: trip.travelStyle,
      connectionStatus: 'NONE',
      creator: {
        id: trip.creator.id,
        fullName: trip.creator.fullName,
        avatarUrl: trip.creator.avatarUrl,
        coverUrl: trip.creator.coverUrl,
        bio: trip.creator.bio,
        dateOfBirth: trip.creator.dateOfBirth,
        city: trip.creator.city,
        state: trip.creator.state,
        country: trip.creator.country?.name ?? null,
        countryCode: trip.creator.countryCode,
        travelPersonality: trip.creator.travelPersonality,
        travelType: trip.creator.travelType,
        interests: trip.creator.interests.map((i) => i.interest),
        languages: trip.creator.languages.map((l) => l.language),
        skills: trip.creator.skills.map((s) => s.skill),
        createdAt: trip.creator.createdAt,
      },
    }));
  }

  async getCandidateTripsForMatching(
    tripId: string | null | undefined,
    userId: string,
    filterCriteria?: CandidateTripFilterCriteria,
  ): Promise<CandidateTripDetail[]> {
    const where: Prisma.TripWhereInput = {
      createdBy: { not: userId },
      status: TripStatus.UPCOMING,
      dateTo: { gte: new Date() },
      creator: {
        accountStatus: 'ACTIVE',
      },
    };

    if (tripId) {
      where.id = { not: tripId };
    }

    // 1. Stage 1 Indexed Funneling: State-based destination + Overlapping dates
    if (filterCriteria?.targetTrips && filterCriteria.targetTrips.length > 0) {
      const tripConditions: Prisma.TripWhereInput[] = [];

      for (const trip of filterCriteria.targetTrips) {
        // Overlapping dates window (with 5-day flexibility buffer)
        const maxDate = new Date(trip.dateTo);
        maxDate.setDate(maxDate.getDate() + 5);
        const minDate = new Date(trip.dateFrom);
        minDate.setDate(minDate.getDate() - 5);

        const condition: Prisma.TripWhereInput = {
          dateFrom: { lte: maxDate },
          dateTo: { gte: minDate },
        };

        // State-based filtering: connect companions traveling to the same region (e.g. Himachal Pradesh, Goa, Kerala)
        if (trip.destinationState) {
          condition.destination = {
            state: {
              equals: trip.destinationState,
              mode: 'insensitive',
            },
          };
        } else if (trip.destinationCountryCode) {
          // Fallback only if state is null/undefined (e.g. city-state)
          condition.destination = {
            countryCode: trip.destinationCountryCode,
          };
        }

        tripConditions.push(condition);
      }

      if (tripConditions.length > 0) {
        where.OR = tripConditions;
      }
    }

    // 2. Search mode specific filters
    if (
      filterCriteria?.destinationName ||
      filterCriteria?.city ||
      filterCriteria?.state ||
      filterCriteria?.countryCode
    ) {
      const destFilter: Prisma.DestinationWhereInput = {};
      if (filterCriteria.countryCode) {
        destFilter.countryCode = filterCriteria.countryCode;
      }
      if (filterCriteria.state) {
        destFilter.state = {
          contains: filterCriteria.state,
          mode: 'insensitive',
        };
      }
      if (filterCriteria.city) {
        destFilter.city = {
          contains: filterCriteria.city,
          mode: 'insensitive',
        };
      }
      if (filterCriteria.destinationName) {
        destFilter.name = {
          contains: filterCriteria.destinationName,
          mode: 'insensitive',
        };
      }
      where.destination = destFilter;
    }

    if (filterCriteria?.dateFrom && filterCriteria?.dateTo) {
      where.dateFrom = { lte: filterCriteria.dateTo };
      where.dateTo = { gte: filterCriteria.dateFrom };
    }

    if (filterCriteria?.travelStyle) {
      where.travelStyle = filterCriteria.travelStyle as TripStyle;
    }

    if (filterCriteria?.budgetStyle) {
      where.budgetStyle = filterCriteria.budgetStyle as BudgetStyle;
    }

    const takeLimit =
      filterCriteria?.limit && filterCriteria.limit > 0
        ? filterCriteria.limit
        : 100;

    const [connections, sentRequests, receivedRequests, trips] =
      await Promise.all([
        this.prisma.connection.findMany({
          where: {
            OR: [
              { userAId: userId, isActive: true },
              { userBId: userId, isActive: true },
            ],
          },
          select: { userAId: true, userBId: true },
        }),
        this.prisma.connectionRequest.findMany({
          where: {
            senderId: userId,
            status: ConnectionRequestStatus.PENDING,
          },
          select: { receiverId: true, id: true },
        }),
        this.prisma.connectionRequest.findMany({
          where: {
            receiverId: userId,
            status: ConnectionRequestStatus.PENDING,
          },
          select: { senderId: true, id: true },
        }),
        this.prisma.trip.findMany({
          where,
          orderBy: {
            dateFrom: 'asc',
          },
          include: {
            destination: {
              include: {
                country: true,
              },
            },
            creator: {
              include: {
                interests: true,
                languages: true,
                skills: true,
                country: true,
              },
            },
          },
          take: takeLimit,
        }),
      ]);

    const connectedUserIds = new Set<string>();
    for (const conn of connections) {
      if (conn.userAId === userId) {
        connectedUserIds.add(conn.userBId);
      } else {
        connectedUserIds.add(conn.userAId);
      }
    }

    const sentRequestsUserMap = new Map<string, string>();
    for (const req of sentRequests) {
      sentRequestsUserMap.set(req.receiverId, req.id);
    }

    const receivedRequestsUserMap = new Map<string, string>();
    for (const req of receivedRequests) {
      receivedRequestsUserMap.set(req.senderId, req.id);
    }

    return trips.map((trip) => {
      let connectionStatus:
        | 'CONNECTED'
        | 'REQUEST_SENT'
        | 'REQUEST_RECEIVED'
        | 'NONE' = 'NONE';
      let requestId: string | undefined = undefined;

      const creatorId = trip.creator.id;
      if (connectedUserIds.has(creatorId)) {
        connectionStatus = 'CONNECTED';
      } else if (sentRequestsUserMap.has(creatorId)) {
        connectionStatus = 'REQUEST_SENT';
        requestId = sentRequestsUserMap.get(creatorId);
      } else if (receivedRequestsUserMap.has(creatorId)) {
        connectionStatus = 'REQUEST_RECEIVED';
        requestId = receivedRequestsUserMap.get(creatorId);
      }

      return {
        id: trip.id,
        name: trip.name,
        destinationId: trip.destinationId,
        destinationName: trip.destination.name,
        destinationCity: trip.destination.city,
        destinationState: trip.destination.state,
        destinationCountryCode: trip.destination.countryCode,
        destinationCountryName: trip.destination.country.name,
        destinationLat: Number(trip.destination.latitude),
        destinationLng: Number(trip.destination.longitude),
        coverUrl: trip.destination.coverUrl,
        dateFrom: trip.dateFrom,
        dateTo: trip.dateTo,
        budgetStyle: trip.budgetStyle,
        travelStyle: trip.travelStyle,
        connectionStatus,
        requestId,
        creator: {
          id: trip.creator.id,
          fullName: trip.creator.fullName,
          avatarUrl: trip.creator.avatarUrl,
          coverUrl: trip.creator.coverUrl,
          bio: trip.creator.bio,
          dateOfBirth: trip.creator.dateOfBirth,
          city: trip.creator.city,
          state: trip.creator.state,
          country: trip.creator.country?.name ?? null,
          countryCode: trip.creator.countryCode,
          travelPersonality: trip.creator.travelPersonality,
          travelType: trip.creator.travelType,
          interests: trip.creator.interests.map((i) => i.interest),
          languages: trip.creator.languages.map((l) => l.language),
          skills: trip.creator.skills.map((s) => s.skill),
          createdAt: trip.creator.createdAt,
        },
      };
    });
  }

  async getBuddiesUpcomingTrips(
    userId: string,
  ): Promise<BuddyUpcomingTripDTO[]> {
    const connections = await this.prisma.connection.findMany({
      where: {
        OR: [
          { userAId: userId, isActive: true },
          { userBId: userId, isActive: true },
        ],
      },
      select: { userAId: true, userBId: true },
    });

    if (connections.length === 0) {
      return [];
    }

    const buddyIds = connections.map((conn) =>
      conn.userAId === userId ? conn.userBId : conn.userAId,
    );

    const trips = await this.prisma.trip.findMany({
      where: {
        createdBy: { in: buddyIds },
        status: TripStatus.UPCOMING,
        dateTo: { gte: new Date() },
        creator: {
          accountStatus: 'ACTIVE',
        },
      },
      include: {
        destination: {
          include: {
            country: true,
          },
        },
        creator: {
          include: {
            country: true,
          },
        },
      },
      orderBy: {
        dateFrom: 'asc',
      },
      take: 12,
    });

    return trips.map((trip) => ({
      tripId: trip.id,
      tripName: trip.name,
      destination: {
        id: trip.destination.id,
        name: trip.destination.name,
        city: trip.destination.city,
        state: trip.destination.state,
        country: trip.destination.country?.name ?? null,
        coverUrl: trip.destination.coverUrl,
      },
      dateFrom: trip.dateFrom,
      dateTo: trip.dateTo,
      travelStyle: trip.travelStyle,
      budgetStyle: trip.budgetStyle,
      buddy: {
        id: trip.creator.id,
        fullName: trip.creator.fullName,
        avatarUrl: trip.creator.avatarUrl,
        coverUrl: trip.creator.coverUrl,
        age: trip.creator.dateOfBirth
          ? calculateAge(trip.creator.dateOfBirth)
          : null,
        city: trip.creator.city,
        state: trip.creator.state,
        country: trip.creator.country?.name ?? null,
        travelPersonality: trip.creator.travelPersonality,
      },
    }));
  }
}
