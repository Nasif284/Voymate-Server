export enum AnalyticsPeriod {
  TODAY = 'TODAY',
  LAST_7_DAYS = 'LAST_7_DAYS',
  LAST_30_DAYS = 'LAST_30_DAYS',
  LAST_3_MONTHS = 'LAST_3_MONTHS',
  LAST_6_MONTHS = 'LAST_6_MONTHS',
  LAST_YEAR = 'LAST_YEAR',
}
export interface AdminAnalyticsDTO {
  period: AnalyticsPeriod;
  users: {
    total: number;
    newUsers: number;
    growth: {
      period: Date;
      count: number;
    }[];

    acquisition: {
      source: string;
      count: number;
      percentage: number;
    }[];

    byLocation: {
      countryCode: string;
      countryName: string;
      count: number;
    }[];
  };

  trips: {
    total: number;
    newTrips: number;
    activeTrips: number;

    topDestinations: {
      destinationId: string;
      name: string;
      count: number;
    }[];
  };

  connections: {
    total: number;
    newConnections: number;
  };

  verifications: {
    pending: number;
  };
}
