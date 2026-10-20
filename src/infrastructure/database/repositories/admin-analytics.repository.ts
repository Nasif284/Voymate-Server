import { PrismaClient, VerificationStatus } from '@prisma/client';
import { IAdminAnalyticsRepository } from '../../../application/interfaces/repositories/admin-analytics.repository';
import { inject, injectable } from 'tsyringe';
import { TOKENS } from '../../di/tokens';
@injectable()
export class AdminAnalyticsRepository implements IAdminAnalyticsRepository {
  constructor(
    @inject(TOKENS.PrismaClient) private readonly prisma: PrismaClient,
  ) {}

  async getTotalUsers(): Promise<number> {
    return this.prisma.user.count({
      where: {
        deletedAt: null,
      },
    });
  }

  async getNewUsers(startDate: Date, endDate: Date): Promise<number> {
    return this.prisma.user.count({
      where: {
        deletedAt: null,
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
      },
    });
  }
  async getUserGrowth(
    startDate: Date,
    endDate: Date,
    interval: 'hour' | 'day' | 'month',
  ): Promise<
    {
      period: Date;
      count: number;
    }[]
  > {
    const result = await this.prisma.$queryRaw<
      {
        period: Date;
        count: bigint;
      }[]
    >`
    WITH periods AS (
      SELECT generate_series(
        DATE_TRUNC(
          CAST(${interval} AS text),
          CAST(${startDate} AS timestamptz)
        ),
        DATE_TRUNC(
          CAST(${interval} AS text),
          CAST(${endDate} AS timestamptz) - INTERVAL '1 second'
        ),
        ('1 ' || CAST(${interval} AS text))::interval
      ) AS period
    ),

    user_counts AS (
      SELECT
        DATE_TRUNC(
          CAST(${interval} AS text),
          "created_at"
        ) AS period,
        COUNT(*) AS count
      FROM "users"
      WHERE
        "deleted_at" IS NULL
        AND "created_at" >= ${startDate}
        AND "created_at" < ${endDate}
      GROUP BY 1
    )

    SELECT
      periods.period,
      COALESCE(user_counts.count, 0) AS count
    FROM periods
    LEFT JOIN user_counts
      ON periods.period = user_counts.period
    ORDER BY periods.period ASC
  `;

    return result.map((item) => ({
      period: item.period,
      count: Number(item.count),
    }));
  }
  async getUserAcquisition(
    startDate: Date,
    endDate: Date,
  ): Promise<
    {
      source: string;
      count: number;
    }[]
  > {
    const result = await this.prisma.userOnboarding.groupBy({
      by: ['onboardingSource'],
      where: {
        onboardingSource: {
          not: null,
        },
        user: {
          createdAt: {
            gte: startDate,
            lt: endDate,
          },
        },
      },
      _count: {
        userId: true,
      },
    });

    return result.map((item) => ({
      source: item.onboardingSource!,
      count: item._count.userId,
    }));
  }

  async getUsersByLocation(
    startDate: Date,
    endDate: Date,
  ): Promise<
    {
      countryCode: string;
      countryName: string;
      count: number;
    }[]
  > {
    const result = await this.prisma.user.groupBy({
      by: ['countryCode'],
      where: {
        deletedAt: null,
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
        countryCode: {
          not: null,
        },
      },
      _count: {
        id: true,
      },
    });

    const countryCodes = result
      .map((item) => item.countryCode)
      .filter((code): code is string => code !== null);

    if (countryCodes.length === 0) {
      return [];
    }

    const countries = await this.prisma.country.findMany({
      where: {
        code: {
          in: countryCodes,
        },
      },
      select: {
        code: true,
        name: true,
      },
    });

    const countryMap = new Map(
      countries.map((country) => [country.code, country.name]),
    );

    return result
      .map((item) => ({
        countryCode: item.countryCode!,
        countryName: countryMap.get(item.countryCode!) ?? 'Unknown',
        count: item._count.id,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  async getTotalTrips(): Promise<number> {
    return this.prisma.trip.count({
      where: {
        deletedAt: null,
      },
    });
  }

  async getNewTrips(startDate: Date, endDate: Date): Promise<number> {
    return this.prisma.trip.count({
      where: {
        deletedAt: null,
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
      },
    });
  }

  async getActiveTrips(today: Date): Promise<number> {
    return this.prisma.trip.count({
      where: {
        deletedAt: null,
        dateTo: {
          gte: today,
        },
      },
    });
  }

  async getTopTripDestinations(
    startDate: Date,
    endDate: Date,
    limit: number,
  ): Promise<
    {
      destinationId: string;
      name: string;
      count: number;
    }[]
  > {
    const result = await this.prisma.trip.groupBy({
      by: ['destinationId'],
      where: {
        deletedAt: null,
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: limit,
    });

    if (result.length === 0) {
      return [];
    }

    const destinationIds = result.map((item) => item.destinationId);

    const destinations = await this.prisma.destination.findMany({
      where: {
        id: {
          in: destinationIds,
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const destinationMap = new Map(
      destinations.map((destination) => [destination.id, destination.name]),
    );

    return result.map((item) => ({
      destinationId: item.destinationId,
      name: destinationMap.get(item.destinationId) ?? 'Unknown destination',
      count: item._count.id,
    }));
  }

  async getTotalConnections(): Promise<number> {
    return this.prisma.connection.count({
      where: {
        isActive: true,
      },
    });
  }

  async getNewConnections(startDate: Date, endDate: Date): Promise<number> {
    return this.prisma.connection.count({
      where: {
        isActive: true,
        connectedAt: {
          gte: startDate,
          lt: endDate,
        },
      },
    });
  }

  async getPendingVerifications(): Promise<number> {
    return this.prisma.verification.count({
      where: {
        status: {
          in: [VerificationStatus.PROCESSING, VerificationStatus.UNDER_REVIEW],
        },
      },
    });
  }
}
