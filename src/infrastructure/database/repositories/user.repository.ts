import {
  Prisma,
  PrismaClient,
  User as PrismaUser,
  ConnectionRequestStatus,
  OnboardingSource,
  ProfileVisibility,
  RequestFromOption,
  TripStatus,
} from '@prisma/client';
import { BaseRepository } from './base.repository';

import {
  IUserRepository,
  CreateUserData,
  UpdateLocationData,
} from '../../../application/interfaces/repositories/user.reposetory';

import { User } from '../../../domain/entities/user/user.entity';

import { GetAllUsersRequestDTO } from '../../../application/dtos/user-management/request/get-users.dto';
import { inject, injectable } from 'tsyringe';
import { TOKENS } from '../../di/tokens';
import { ChangeUserStatusRequestDTO } from '../../../application/dtos/user-management/request/change-status.dto';
import { AccountStatus, OnlineStatus } from '../../../domain/enums';
import { OnboardingSourceRequestDTO } from '../../../application/dtos/onbaording/request/source.dto';
import {
  AlreadyRequestSentError,
  ConnectionAlreadyExistError,
  UserLocationDataMissingError,
} from '../../../domain/errors/user.error';
import {
  UserCardDetailsResponseDTO,
  UserWithDetails,
} from '../../../application/dtos/users/response/user-card.dto';
import { calculateAge } from '../../../shared/helpers/calculateAge';
import { NearbyUsersResponseDTO } from '../../../application/dtos/users/response/nearby-users.dto';
import { GetUserProfileResponseDTO } from '../../../application/dtos/users/response/user-profile.dto';
import { UserNotFoundError } from '../../../domain/errors/auth.error';
import { SendConnectionRequestDTO } from '../../../application/dtos/connections/requests/send-connection-request.dto';
import { GetIncomingRequestsResponseDTO } from '../../../application/dtos/connections/response/get-requests.dto';
import { GetConnectionsResponseDTO } from '../../../application/dtos/connections/response/get-connections.dto';
import { UpdateSettingsRequestDTO } from '../../../application/dtos/profile/request/settings-update.dto';
import { GetSettingsResponseDTO } from '../../../application/dtos/profile/response/get-settings.dto';
import { GetAllRequestsResponseDTO } from '../../../application/dtos/connections/response/get-all-requests.dto';
import { GetSentRequestsResponseDTO } from '../../../application/dtos/connections/response/get-sent-requests.dto';
import { UserMapper } from '../mappers/user.mapper';
import {
  formatAccountStatusDisplayName,
  formatEnumToDisplayName,
} from '../../../shared/helpers/enum-formatter.helper';
@injectable()
export class UserRepository
  extends BaseRepository<
    PrismaUser,
    Prisma.UserCreateInput,
    Prisma.UserUpdateInput
  >
  implements IUserRepository
{
  constructor(@inject(TOKENS.PrismaClient) prisma: PrismaClient) {
    super(prisma, prisma.user);
  }

  private async findUser(
    where: Prisma.UserWhereInput,
    include?: object,
  ): Promise<User | null> {
    const result = await this.findFirst(
      {
        ...where,
        deletedAt: null,
      },
      include,
    );
    if (!result) return null;

    return UserMapper.toDomain(result);
  }

  async findUserById(id: string, include?: object): Promise<User | null> {
    return this.findUser(
      {
        id,
      },
      include,
    );
  }

  async findByEmail(email: string, include?: object): Promise<User | null> {
    return this.findUser(
      {
        email,
      },
      include,
    );
  }

  async createUser(data: CreateUserData): Promise<User> {
    const user = await this.prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          fullName: data.fullName,

          email: data.email,

          passwordHash: data.passwordHash,

          ...(data.isEmailVerified && {
            isEmailVerified: true,
          }),
        },
      });

      await tx.userPrivacy.create({
        data: {
          userId: createdUser.id,
        },
      });

      return createdUser;
    });

    return UserMapper.toDomain(user);
  }

  async updateEmailVerified(email: string): Promise<void> {
    await this.update(
      { email },
      {
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
      },
    );
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await this.update(
      { id },
      {
        passwordHash,
      },
    );
  }

  async getAllUsers(payload: GetAllUsersRequestDTO): Promise<{
    users: User[];
    count: number;
  }> {
    const { page, limit, filter, sortBy, sortOrder } = payload;
    const ALLOWED_SORT_COLUMNS = ['createdAt', 'fullName', 'email'] as const;
    type AllowedSort = (typeof ALLOWED_SORT_COLUMNS)[number];

    const safeSortBy: AllowedSort = ALLOWED_SORT_COLUMNS.includes(
      sortBy as AllowedSort,
    )
      ? (sortBy as AllowedSort)
      : 'createdAt';

    const where: Prisma.UserWhereInput = {
      deletedAt: null,
    };

    if (filter.status && filter.status !== 'all') {
      where.accountStatus = filter.status.toUpperCase() as AccountStatus;
    }

    if (filter.joined === '7d') {
      const date = new Date();

      date.setDate(date.getDate() - 7);

      where.createdAt = {
        gte: date,
      };
    }

    if (filter.joined === '30d') {
      const date = new Date();

      date.setDate(date.getDate() - 30);

      where.createdAt = {
        gte: date,
      };
    }

    if (filter.joined === '1y') {
      const date = new Date();

      date.setFullYear(date.getFullYear() - 1);

      where.createdAt = {
        gte: date,
      };
    }

    if (filter.search?.trim()) {
      where.OR = [
        {
          fullName: {
            contains: filter.search,
            mode: 'insensitive',
          },
        },
        {
          email: {
            contains: filter.search,
            mode: 'insensitive',
          },
        },
      ];
    }
    if (filter.verified && filter.verified !== 'any') {
      if (filter.verified == 'yes') {
        where.isEmailVerified = true;
      } else if (filter.verified == 'no') {
        where.isEmailVerified = false;
      }
    }
    const [users, count] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [safeSortBy]: sortOrder },
      }),

      this.prisma.user.count({
        where,
      }),
    ]);

    return {
      users: users.map(UserMapper.toDomain),
      count,
    };
  }

  async changeUserStatus(payload: ChangeUserStatusRequestDTO): Promise<void> {
    const { userId, action, reason } = payload;
    let accountStatusCode: AccountStatus;

    switch (action) {
      case 'activate':
        accountStatusCode = AccountStatus.ACTIVE;
        break;

      case 'suspend':
        accountStatusCode = AccountStatus.SUSPENDED;
        break;

      case 'ban':
        accountStatusCode = AccountStatus.BANNED;
        break;

      default:
        throw new Error('Invalid status');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: {
          id: userId,
        },

        data: {
          accountStatus: accountStatusCode,
        },
      });
      await tx.userStatusHistory.create({
        data: {
          userId,
          reason,
          statusCode: accountStatusCode,
          effectiveFrom: new Date(),
        },
      });
    });
  }

  async addUserOnboardingSource(
    payload: OnboardingSourceRequestDTO,
  ): Promise<void> {
    await this.prisma.userOnboarding.upsert({
      where: {
        userId: payload.userId,
      },
      create: {
        userId: payload.userId,
        onboardingSource: payload.source as OnboardingSource,
        onboardingStep: 2,
        onboardingCompleted: false,
      },
      update: {
        onboardingSource: payload.source as OnboardingSource,
      },
    });
  }

  async updateUser(userId: string, payload: object): Promise<void> {
    await super.update({ id: userId }, payload);
  }
  async createSkills(userId: string, skills: string[]): Promise<void> {
    for (const skill of skills) {
      await this.prisma.userSkill.create({
        data: {
          skill,
          userId,
        },
      });
    }
  }
  async createLanguages(userId: string, languages: string[]): Promise<void> {
    for (const language of languages) {
      await this.prisma.userLanguage.create({
        data: {
          language,
          userId,
        },
      });
    }
  }

  async createTravelInterests(
    userId: string,
    interests: string[],
  ): Promise<void> {
    for (const interest of interests) {
      await this.prisma.userInterest.create({
        data: {
          interest,
          userId,
        },
      });
    }
  }

  async updateOnboarding(userId: string, payload: object): Promise<void> {
    await this.prisma.userOnboarding.update({
      where: { userId },
      data: payload,
    });
  }

  async updateUserLocation(payload: UpdateLocationData): Promise<void> {
    await this.prisma.userLocation.upsert({
      where: {
        userId: payload.userId,
      },
      create: {
        userId: payload.userId,
        currentLat: payload.latitude,
        currentLng: payload.longitude,
        currentCity: payload.city,
        currentCountryCode: payload.countryCode,
        lastSeenAt: new Date(),
        onlineStatus: OnlineStatus.ONLINE,
      },
      update: {
        currentLat: payload.latitude,
        currentLng: payload.longitude,
        currentCity: payload.city,
        currentCountryCode: payload.countryCode,
        lastSeenAt: new Date(),
        onlineStatus: OnlineStatus.ONLINE,
      },
    });

    try {
      await this.prisma.$executeRaw`
        UPDATE user_locations
        SET coordinates = ST_SetSRID(ST_MakePoint(${payload.longitude}::double precision, ${payload.latitude}::double precision), 4326)::geography
        WHERE user_id = ${payload.userId}::uuid
      `;
    } catch {
      // Ignore if spatial update fails
    }
  }
  async getUserLocation(
    userId: string,
  ): Promise<{ lat: number; lang: number }> {
    const userLocation = await this.prisma.userLocation.findFirst({
      where: { userId },
      select: { currentLat: true, currentLng: true },
    });
    if (!userLocation) {
      throw new UserLocationDataMissingError();
    }
    const { currentLat, currentLng } = userLocation;
    if (!currentLat || !currentLng) {
      throw new UserLocationDataMissingError();
    }
    return { lat: currentLat?.toNumber(), lang: currentLng?.toNumber() };
  }

  async getUsersForCard(
    currentUserId: string,
    params: { page: number; limit: number },
  ): Promise<UserCardDetailsResponseDTO> {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    // 1. Fetch current user's active upcoming trip
    const activeTrip = await this.prisma.trip.findFirst({
      where: {
        createdBy: currentUserId,
        status: TripStatus.UPCOMING,
        deletedAt: null,
        dateTo: { gte: new Date() },
      },
      orderBy: { dateFrom: 'asc' },
      include: { destination: true },
    });

    // 2. Destination and region/state exclusion criteria
    const destinationExclusion: Prisma.TripWhereInput | undefined = activeTrip
      ? {
          OR: [
            { destinationId: activeTrip.destinationId },
            ...(activeTrip.destination?.name
              ? [
                  {
                    destination: {
                      name: {
                        equals: activeTrip.destination.name,
                        mode: 'insensitive' as const,
                      },
                    },
                  },
                ]
              : []),
            ...(activeTrip.destination?.state
              ? [
                  {
                    destination: {
                      state: {
                        equals: activeTrip.destination.state,
                        mode: 'insensitive' as const,
                      },
                    },
                  },
                ]
              : []),
          ],
        }
      : undefined;

    // 3. Fetch candidate trips ordered by dateFrom: 'asc'
    const trips = await this.prisma.trip.findMany({
      where: {
        createdBy: { not: currentUserId },
        status: TripStatus.UPCOMING,
        deletedAt: null,
        dateTo: { gte: new Date() },
        NOT: destinationExclusion,
        creator: {
          accountStatus: AccountStatus.ACTIVE,
          deletedAt: null,
          onboarding: { onboardingCompleted: true },
        },
      },
      orderBy: { dateFrom: 'asc' },
      include: {
        destination: {
          include: { country: true },
        },
        creator: {
          include: {
            country: true,
            interests: true,
          },
        },
      },
    });

    // 4. Deduplicate by trip.createdBy (preserves earliest trip per user)
    const uniqueUserTrips: typeof trips = [];
    const seenUsers = new Set<string>();
    for (const trip of trips) {
      if (!seenUsers.has(trip.createdBy)) {
        seenUsers.add(trip.createdBy);
        uniqueUserTrips.push(trip);
      }
    }

    const total = uniqueUserTrips.length;
    const paginatedTrips = uniqueUserTrips.slice(skip, skip + limit);

    // 5. Map to UserCardDetailsResponseDTO
    return {
      users: paginatedTrips.map((trip) => {
        const u = trip.creator;
        return {
          id: u.id,
          fullName: u.fullName,
          avatarUrl: u.avatarUrl,
          coverUrl: u.coverUrl,
          age: u.dateOfBirth ? calculateAge(u.dateOfBirth) : null,
          city: u.city,
          state: u.state,
          country: u.country?.name ?? null,
          travelType: u.travelType,
          travelPersonality: u.travelPersonality,
          interests: u.interests.map((i) => i.interest),
          isTraveling: u.isTraveling,
          activeTrip: {
            id: trip.id,
            name: trip.name,
            destination: trip.destination.name,
            destinationCity: trip.destination.city,
            destinationState: trip.destination.state,
            destinationCountry:
              trip.destination.country?.name ?? trip.destination.countryCode,
            dateFrom: trip.dateFrom,
            dateTo: trip.dateTo,
            travelStyle: trip.travelStyle,
            budgetStyle: trip.budgetStyle,
          },
        };
      }),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getNearbyUsers(
    currentUserId: string,
    page: number,
    limit: number,
    radiusKm = 50,
  ): Promise<NearbyUsersResponseDTO> {
    const offset = (page - 1) * limit;

    const currentUser = await this.prisma.user.findUnique({
      where: { id: currentUserId },
      select: {
        state: true,
        countryCode: true,
        location: {
          select: {
            currentLat: true,
            currentLng: true,
            currentState: true,
            currentCountryCode: true,
          },
        },
      },
    });

    const userState =
      currentUser?.location?.currentState || currentUser?.state || null;
    const hasCoordinates = !!(
      currentUser?.location?.currentLat && currentUser?.location?.currentLng
    );
    const latitude = hasCoordinates
      ? Number(currentUser!.location!.currentLat)
      : null;
    const longitude = hasCoordinates
      ? Number(currentUser!.location!.currentLng)
      : null;

    if (hasCoordinates) {
      const users = await this.prisma.$queryRaw<UserWithDetails[]>`
        SELECT
          u.id,
          u.full_name AS "fullName",
          u.avatar_url AS "avatarUrl",
          u.cover_url AS "coverUrl",
          u.is_traveling AS "isTraveling",
          EXTRACT(
            YEAR FROM AGE(
              CURRENT_DATE,
              u.date_of_birth
            )
          )::int AS age,
          u.origin_city AS city,
          u.origin_region AS state,
          c.name AS country,
          u.travel_type AS "travelType",
          u.travel_personality AS "travelPersonality",
          COALESCE(
            ARRAY_AGG(
              DISTINCT ui.interest
            ) FILTER (
              WHERE ui.interest IS NOT NULL
            ),
            '{}'
          ) AS interests,
          ROUND(
            (
              ST_Distance(
                COALESCE(
                  CASE
                    WHEN ul.current_lng IS NOT NULL AND ul.current_lat IS NOT NULL
                    THEN ST_SetSRID(
                      ST_MakePoint(
                        ul.current_lng::double precision,
                        ul.current_lat::double precision
                      ),
                      4326
                    )::geography
                    ELSE NULL
                  END,
                  ul.coordinates
                ),
                ST_SetSRID(
                  ST_MakePoint(
                    ${longitude}::double precision,
                    ${latitude}::double precision
                  ),
                  4326
                )::geography
              ) / 1000
            )::numeric,
            1
          )::double precision AS "distanceKm"
        FROM users u
        INNER JOIN user_locations ul
          ON ul.user_id = u.id
        LEFT JOIN user_onboarding uo
          ON uo.user_id = u.id
        LEFT JOIN countries c
          ON c.code = u.country_code
        LEFT JOIN user_interests ui
          ON ui.user_id = u.id
        WHERE
          u.id <> ${currentUserId}::uuid
          AND u.deleted_at IS NULL
          AND u.account_status = 'ACTIVE'
          AND (uo.onboarding_completed = true OR uo.user_id IS NULL)
          AND u.is_traveling = true
          AND (
            (ul.current_lat IS NOT NULL AND ul.current_lng IS NOT NULL)
            OR ul.coordinates IS NOT NULL
          )
          AND ST_DWithin(
            COALESCE(
              CASE
                WHEN ul.current_lng IS NOT NULL AND ul.current_lat IS NOT NULL
                THEN ST_SetSRID(
                  ST_MakePoint(
                    ul.current_lng::double precision,
                    ul.current_lat::double precision
                  ),
                  4326
                )::geography
                ELSE NULL
              END,
              ul.coordinates
            ),
            ST_SetSRID(
              ST_MakePoint(
                ${longitude}::double precision,
                ${latitude}::double precision
              ),
              4326
            )::geography,
            ${radiusKm * 1000}
          )
        GROUP BY
          u.id,
          u.full_name,
          u.avatar_url,
          u.cover_url,
          u.date_of_birth,
          u.origin_city,
          u.origin_region,
          c.name,
          u.travel_type,
          u.travel_personality,
          u.is_traveling,
          ul.current_lat,
          ul.current_lng,
          ul.coordinates
        ORDER BY
          "distanceKm" ASC
        LIMIT ${limit}
        OFFSET ${offset}
      `;

      const totalResult = await this.prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(DISTINCT u.id)::bigint AS count
        FROM users u
        INNER JOIN user_locations ul
          ON ul.user_id = u.id
        LEFT JOIN user_onboarding uo
          ON uo.user_id = u.id
        WHERE
          u.id <> ${currentUserId}::uuid
          AND u.deleted_at IS NULL
          AND u.account_status = 'ACTIVE'
          AND (uo.onboarding_completed = true OR uo.user_id IS NULL)
          AND u.is_traveling = true
          AND (
            (ul.current_lat IS NOT NULL AND ul.current_lng IS NOT NULL)
            OR ul.coordinates IS NOT NULL
          )
          AND ST_DWithin(
            COALESCE(
              CASE
                WHEN ul.current_lng IS NOT NULL AND ul.current_lat IS NOT NULL
                THEN ST_SetSRID(
                  ST_MakePoint(
                    ul.current_lng::double precision,
                    ul.current_lat::double precision
                  ),
                  4326
                )::geography
                ELSE NULL
              END,
              ul.coordinates
            ),
            ST_SetSRID(
              ST_MakePoint(
                ${longitude}::double precision,
                ${latitude}::double precision
              ),
              4326
            )::geography,
            ${radiusKm * 1000}
          )
      `;

      const total = Number(totalResult[0]?.count ?? 0);

      if (users.length > 0) {
        return {
          users: users.map((u) => ({
            ...u,
            distanceKm:
              u.distanceKm !== undefined && u.distanceKm !== null
                ? Number(u.distanceKm)
                : undefined,
          })),
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          isFallback: false,
          radiusKm,
        };
      }
    }

    // Strictly return only travelers within radiusKm (no fallback across state/country)
    return {
      users: [],
      total: 0,
      page,
      limit,
      totalPages: 1,
      isFallback: false,
      radiusKm,
    };
  }

  async getUserWithDetails(userId: string): Promise<GetUserProfileResponseDTO> {
    const user = await this.prisma.user.findFirst({
      where: {
        deletedAt: null,
        id: userId,
      },
      include: {
        location: {
          include: {
            currentCountry: true,
          },
        },
        country: true,
        interests: true,
        languages: true,
        skills: true,
        onboarding: true,
      },
    });
    const tripCount = await this.prisma.trip.count({
      where: {
        createdBy: userId,
        deletedAt: null,
      },
    });
    const connectionsCount = await this.prisma.connection.count({
      where: {
        isActive: true,
        OR: [{ userAId: userId }, { userBId: userId }],
      },
    });
    if (!user) {
      throw new UserNotFoundError();
    }
    return {
      id: user.id,
      status: formatAccountStatusDisplayName(user.accountStatus),
      fullName: user.fullName,
      phone: user.phone,
      isPhoneVerified: user.isPhoneVerified,
      gender: user.gender,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      coverUrl: user.coverUrl,
      age: user.dateOfBirth ? calculateAge(user.dateOfBirth) : null,
      city: user.city ?? null,
      state: user.state ?? null,
      isEmailVerified: user.isEmailVerified,
      country: user.country?.name ?? null,
      travelType: user.travelType ?? null,
      travelPersonality: user.travelPersonality ?? null,
      interests: user.interests.map((i) => i.interest),
      languages: user.languages.map((i) => i.language),
      skills: user.skills.map((i) => i.skill),
      createdAt: user.createdAt,
      isTraveling: user.isTraveling,
      dob: user.dateOfBirth!,
      onboardingCompleted: user.onboarding?.onboardingCompleted ?? false,
      onboardingSource: formatEnumToDisplayName(
        user.onboarding?.onboardingSource,
      ),
      onboardingStep: user.onboarding?.onboardingStep ?? 0,
      matchWith: user.matchPreference!,
      tripCount,
      connectionsCount,
    };
  }

  async sendConnectionRequest(
    payload: SendConnectionRequestDTO,
  ): Promise<void> {
    const existing = await this.prisma.connectionRequest.findFirst({
      where: {
        OR: [
          {
            senderId: payload.senderId,
            receiverId: payload.receiverId,
          },
          {
            senderId: payload.receiverId,
            receiverId: payload.senderId,
          },
        ],
      },
    });
    const connection = await this.prisma.connection.findFirst({
      where: {
        isActive: true,
        OR: [
          {
            userAId: payload.senderId,
            userBId: payload.receiverId,
          },
          {
            userAId: payload.receiverId,
            userBId: payload.senderId,
          },
        ],
      },
    });
    console.log(existing);
    let validMatchId: string | null = null;
    if (payload.matchId) {
      const matchExists = await this.prisma.tripMatch.findUnique({
        where: { id: payload.matchId },
        select: { id: true },
      });
      if (matchExists) {
        validMatchId = payload.matchId;
      }
    }

    if (existing?.id) {
      if (existing.status === ConnectionRequestStatus.PENDING) {
        throw new AlreadyRequestSentError();
      } else if (
        existing.status === ConnectionRequestStatus.CANCELLED ||
        existing.status === ConnectionRequestStatus.DECLINED
      )
        await this.prisma.connectionRequest.update({
          where: {
            id: existing.id,
          },
          data: {
            senderId: payload.senderId,
            receiverId: payload.receiverId,
            matchId: validMatchId,
            message: payload.message,
            status: ConnectionRequestStatus.PENDING,
            respondedAt: null,
            createdAt: new Date(),
          },
        });
      return;
    }
    if (connection?.id) {
      throw new ConnectionAlreadyExistError();
    }
    await this.prisma.connectionRequest.create({
      data: {
        matchId: validMatchId,
        receiverId: payload.receiverId,
        message: payload.message,
        senderId: payload.senderId,
      },
    });
  }
  async getIncomingConnectionRequests(
    userId: string,
  ): Promise<GetIncomingRequestsResponseDTO> {
    const requests = await this.prisma.connectionRequest.findMany({
      where: {
        receiverId: userId,
        status: ConnectionRequestStatus.PENDING,
      },
      include: {
        sender: {
          include: {
            country: true,
          },
        },
      },
    });
    return {
      requests: requests.map((req) => {
        return {
          id: req.id,
          message: req.message,
          matchId: req.matchId,
          sender: {
            id: req.sender.id,
            fullName: req.sender.fullName,
            avatarUrl: req.sender.avatarUrl,
            country: req.sender.country?.name ?? null,
            state: req.sender.state,
          },
          createdAt: req.createdAt,
          status: req.status,
        };
      }),
    };
  }

  async getUserRequests(userId: string): Promise<GetAllRequestsResponseDTO> {
    const requests = await this.prisma.connectionRequest.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
        status: ConnectionRequestStatus.PENDING,
      },
    });
    return {
      requests: requests.map((req) => ({
        id: req.id,
        receiverId: req.receiverId,
        senderId: req.senderId,
      })),
    };
  }

  async getSentRequests(userId: string): Promise<GetSentRequestsResponseDTO> {
    const requests = await this.prisma.connectionRequest.findMany({
      where: {
        senderId: userId,
        status: ConnectionRequestStatus.PENDING,
      },
      include: {
        receiver: {
          include: {
            country: true,
          },
        },
      },
    });
    return {
      requests: requests.map((req) => {
        return {
          id: req.id,
          message: req.message,
          matchId: req.matchId,
          receiver: {
            id: req.receiver.id,
            fullName: req.receiver.fullName,
            avatarUrl: req.receiver.avatarUrl,
            country: req.receiver.country?.name ?? null,
            state: req.receiver.state,
          },
          createdAt: req.createdAt,
          status: req.status,
        };
      }),
    };
  }

  async updateRequestStatus(payload: {
    requestId: string;
    status: string;
  }): Promise<void> {
    const normalizedStatus = payload.status.toUpperCase();
    if (normalizedStatus === 'ACCEPTED') {
      await this.prisma.$transaction(async (tx) => {
        const request = await tx.connectionRequest.update({
          where: {
            id: payload.requestId,
          },
          data: {
            status: ConnectionRequestStatus.ACCEPTED,
            respondedAt: new Date(),
          },
        });

        await tx.connection.create({
          data: {
            userAId: request.senderId,
            userBId: request.receiverId,
            requestId: request.id,
          },
        });
      });
    } else {
      await this.prisma.connectionRequest.update({
        where: {
          id: payload.requestId,
        },
        data: {
          status: normalizedStatus as ConnectionRequestStatus,
          respondedAt: new Date(),
        },
      });
    }
  }
  async getUserConnections(userId: string): Promise<GetConnectionsResponseDTO> {
    const connections = await this.prisma.connection.findMany({
      where: {
        isActive: true,
        OR: [{ userAId: userId }, { userBId: userId }],
      },
      include: {
        userA: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            state: true,
            country: {
              select: {
                name: true,
              },
            },
          },
        },
        userB: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            state: true,
            country: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
    return {
      connections: connections.map((connection) => {
        const otherUser =
          connection.userAId === userId ? connection.userB : connection.userA;
        return {
          id: connection.id,
          userId: otherUser.id,
          fullName: otherUser.fullName,
          avatarUrl: otherUser.avatarUrl,
          country: otherUser.country?.name ?? null,
          state: otherUser.state,
        };
      }),
    };
  }

  async deactivateConnection(connectionId: string): Promise<void> {
    await this.prisma.connection.update({
      where: {
        id: connectionId,
      },
      data: {
        isActive: false,
      },
    });
  }

  async updateSettings(
    userId: string,
    payload: UpdateSettingsRequestDTO,
  ): Promise<void> {
    const data: {
      showOnlineStatus?: boolean;
      showTravelingStatus?: boolean;
      profileVisibility?: ProfileVisibility;
      requestsFrom?: RequestFromOption;
    } = {};

    if (payload.showOnlineStatus !== undefined) {
      data.showOnlineStatus = payload.showOnlineStatus;
    }
    if (payload.showTravelingStatus !== undefined) {
      data.showTravelingStatus = payload.showTravelingStatus;
    }
    if (payload.profileVisibilityCode) {
      data.profileVisibility = payload.profileVisibilityCode
        .toUpperCase()
        .replace(/\s+/g, '_') as ProfileVisibility;
    }
    if (payload.requestsFromCode) {
      data.requestsFrom = payload.requestsFromCode
        .toUpperCase()
        .replace(/\s+/g, '_') as RequestFromOption;
    }

    await this.prisma.userPrivacy.update({
      where: {
        userId,
      },
      data,
    });
  }

  async getSettings(userId: string): Promise<GetSettingsResponseDTO> {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        phone: true,
        isPhoneVerified: true,
      },
    });
    const result = await this.prisma.userPrivacy.findFirst({
      where: {
        userId,
      },
    });
    if (!result) {
      throw new Error('Settings not found');
    }
    return {
      profileVisibilityCode: result.profileVisibility!,
      requestsFromCode: result.requestsFrom!,
      showOnlineStatus: result.showOnlineStatus,
      showTravelingStatus: result.showTravelingStatus,
      phone: user!.phone,
      isPhoneVerified: user!.isPhoneVerified,
    };
  }

  async deleteInterests(userId: string): Promise<void> {
    await this.prisma.userInterest.deleteMany({
      where: {
        userId,
      },
    });
  }

  async deleteLanguages(userId: string): Promise<void> {
    await this.prisma.userLanguage.deleteMany({
      where: {
        userId,
      },
    });
  }

  async deleteSkills(userId: string): Promise<void> {
    await this.prisma.userSkill.deleteMany({
      where: {
        userId,
      },
    });
  }

  async verifyPhone(userId: string, phone: string): Promise<void> {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        phone,
        isPhoneVerified: true,
        phoneVerifiedAt: new Date(),
      },
    });
  }
  async findUserByPhone(
    phone: string,
  ): Promise<{ id: string; isPhoneVerified: boolean } | null> {
    return await this.prisma.user.findFirst({
      where: {
        phone,
      },
      select: {
        id: true,
        isPhoneVerified: true,
      },
    });
  }
}
