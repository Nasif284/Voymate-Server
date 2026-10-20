import { inject, injectable } from 'tsyringe';

import { TOKENS } from '../../../infrastructure/di/tokens';

import { IAdminAnalyticsRepository } from '../../interfaces/repositories/admin-analytics.repository';
import { IAdminAnalyticsUseCase } from '../../interfaces/use-cases/admin-analytics/admin-analytics.interface';
import {
  AdminAnalyticsDTO,
  AnalyticsPeriod,
} from '../../dtos/admin-analytics/response/admin-analytics.dto';
import { formatEnumToDisplayName } from '../../../shared/helpers/enum-formatter.helper';

@injectable()
export class AdminAnalyticsUseCase implements IAdminAnalyticsUseCase {
  constructor(
    @inject(TOKENS.IAdminAnalyticsRepository)
    private readonly analyticsRepository: IAdminAnalyticsRepository,
  ) {}

  async execute(period: AnalyticsPeriod): Promise<AdminAnalyticsDTO> {
    const { startDate, endDate } = this.getDateRange(period);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const growthInterval = this.getGrowthInterval(period);

    const [
      totalUsers,
      newUsers,
      userGrowth,
      userAcquisition,
      usersByLocation,

      totalTrips,
      newTrips,
      activeTrips,
      topTripDestinations,

      totalConnections,
      newConnections,

      pendingVerifications,
    ] = await Promise.all([
      this.analyticsRepository.getTotalUsers(),

      this.analyticsRepository.getNewUsers(startDate, endDate),

      this.analyticsRepository.getUserGrowth(
        startDate,
        endDate,
        growthInterval,
      ),

      this.analyticsRepository.getUserAcquisition(startDate, endDate),

      this.analyticsRepository.getUsersByLocation(startDate, endDate),

      this.analyticsRepository.getTotalTrips(),

      this.analyticsRepository.getNewTrips(startDate, endDate),

      this.analyticsRepository.getActiveTrips(today),

      this.analyticsRepository.getTopTripDestinations(startDate, endDate, 5),

      this.analyticsRepository.getTotalConnections(),

      this.analyticsRepository.getNewConnections(startDate, endDate),

      this.analyticsRepository.getPendingVerifications(),
    ]);

    const acquisitionTotal = userAcquisition.reduce(
      (total, item) => total + item.count,
      0,
    );

    const acquisition = userAcquisition.map((item) => ({
      source: formatEnumToDisplayName(item.source),
      count: item.count,
      percentage:
        acquisitionTotal === 0
          ? 0
          : Number(((item.count / acquisitionTotal) * 100).toFixed(2)),
    }));

    return {
      period,

      users: {
        total: totalUsers,
        newUsers,
        growth: userGrowth,
        acquisition,
        byLocation: usersByLocation,
      },

      trips: {
        total: totalTrips,
        newTrips,
        activeTrips,
        topDestinations: topTripDestinations,
      },

      connections: {
        total: totalConnections,
        newConnections,
      },

      verifications: {
        pending: pendingVerifications,
      },
    };
  }

  private getDateRange(period: AnalyticsPeriod): {
    startDate: Date;
    endDate: Date;
  } {
    const endDate = new Date();
    endDate.setHours(0, 0, 0, 0);

    const startDate = new Date(endDate);

    switch (period) {
      case AnalyticsPeriod.TODAY:
        endDate.setDate(endDate.getDate() + 1);
        break;

      case AnalyticsPeriod.LAST_7_DAYS:
        startDate.setDate(startDate.getDate() - 7);
        endDate.setDate(endDate.getDate() + 1);
        break;

      case AnalyticsPeriod.LAST_30_DAYS:
        startDate.setDate(startDate.getDate() - 30);
        endDate.setDate(endDate.getDate() + 1);
        break;

      case AnalyticsPeriod.LAST_3_MONTHS:
        startDate.setMonth(startDate.getMonth() - 3);
        endDate.setDate(endDate.getDate() + 1);
        break;

      case AnalyticsPeriod.LAST_6_MONTHS:
        startDate.setMonth(startDate.getMonth() - 6);
        endDate.setDate(endDate.getDate() + 1);
        break;

      case AnalyticsPeriod.LAST_YEAR:
        startDate.setFullYear(startDate.getFullYear() - 1);
        endDate.setDate(endDate.getDate() + 1);
        break;

      default:
        throw new Error(`Unsupported analytics period: ${period}`);
    }

    return {
      startDate,
      endDate,
    };
  }

  private getGrowthInterval(period: AnalyticsPeriod): 'hour' | 'day' | 'month' {
    switch (period) {
      case AnalyticsPeriod.TODAY:
        return 'hour';

      case AnalyticsPeriod.LAST_7_DAYS:
      case AnalyticsPeriod.LAST_30_DAYS:
      case AnalyticsPeriod.LAST_3_MONTHS:
        return 'day';

      case AnalyticsPeriod.LAST_6_MONTHS:
      case AnalyticsPeriod.LAST_YEAR:
        return 'month';

      default:
        return 'day';
    }
  }
}
