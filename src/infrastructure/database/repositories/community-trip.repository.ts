import { inject, injectable } from 'tsyringe';
import {
  CommunityTrip as PrismaCommunityTrip,
  Prisma,
  PrismaClient,
  $Enums,
} from '@prisma/client';
import { TOKENS } from '../../di/tokens';
import {
  ICommunityTripRepository,
  CommunityTripFilterCriteria,
  CreateCommunityTripData,
  CommunityTripWithOrganizer,
  CommunityTripModel,
} from '../../../application/interfaces/repositories/community.repository';
import {
  CommunityTripCategory,
  CommunityTripPricingType,
  CommunityTripStatus,
} from '../../../domain/enums/community.constants';

const COMMUNITY_SELECT = {
  id: true,
  name: true,
  slug: true,
  avatarUrl: true,
  isVerified: true,
  rating: true,
  city: true,
  state: true,
};

type PrismaTripWithCommunity = PrismaCommunityTrip & {
  community: {
    id: string;
    name: string;
    slug: string;
    avatarUrl: string | null;
    isVerified: boolean;
    rating: Prisma.Decimal | number;
    city: string | null;
    state: string | null;
  };
};

function toCommunityTripModel(t: PrismaCommunityTrip): CommunityTripModel {
  return {
    id: t.id,
    communityId: t.communityId,
    title: t.title,
    slug: t.slug,
    category: t.category as unknown as CommunityTripCategory,
    pricingType: t.pricingType as unknown as CommunityTripPricingType,
    price: t.price ? Number(t.price) : null,
    currency: t.currency,
    priceNote: t.priceNote,
    destinationName: t.destinationName,
    city: t.city,
    state: t.state,
    country: t.country,
    dateFrom: t.dateFrom,
    dateTo: t.dateTo,
    durationText: t.durationText,
    maxCapacity: t.maxCapacity,
    joinedCount: t.joinedCount,
    description: t.description,
    itinerary: t.itinerary,
    gallery: t.gallery,
    inclusions: t.inclusions,
    exclusions: t.exclusions,
    status: t.status as unknown as CommunityTripStatus,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    deletedAt: t.deletedAt,
  };
}

function toCommunityTripWithOrganizer(
  t: PrismaTripWithCommunity,
): CommunityTripWithOrganizer {
  return {
    ...toCommunityTripModel(t),
    community: {
      id: t.community.id,
      name: t.community.name,
      slug: t.community.slug,
      avatarUrl: t.community.avatarUrl,
      isVerified: t.community.isVerified,
      rating: Number(t.community.rating),
      city: t.community.city,
      state: t.community.state,
    },
  };
}

@injectable()
export class CommunityTripRepository implements ICommunityTripRepository {
  constructor(
    @inject(TOKENS.PrismaClient) private readonly _prisma: PrismaClient,
  ) {}

  async create(
    data: CreateCommunityTripData,
  ): Promise<CommunityTripWithOrganizer> {
    const { communityId, price, maxCapacity, ...rest } = data;
    const trip = await this._prisma.communityTrip.create({
      data: {
        ...rest,
        maxCapacity: Number(maxCapacity),
        category: rest.category as unknown as $Enums.CommunityTripCategory,
        pricingType:
          rest.pricingType as unknown as $Enums.CommunityTripPricingType,
        price:
          price !== undefined && price !== null
            ? new Prisma.Decimal(price)
            : null,
        community: { connect: { id: communityId } },
      },
      include: {
        community: {
          select: COMMUNITY_SELECT,
        },
      },
    });

    return toCommunityTripWithOrganizer(trip as PrismaTripWithCommunity);
  }

  async findById(id: string): Promise<CommunityTripWithOrganizer | null> {
    const trip = await this._prisma.communityTrip.findUnique({
      where: { id },
      include: {
        community: {
          select: COMMUNITY_SELECT,
        },
      },
    });

    if (!trip || trip.deletedAt !== null) return null;
    return toCommunityTripWithOrganizer(trip as PrismaTripWithCommunity);
  }

  async findBySlug(slug: string): Promise<CommunityTripWithOrganizer | null> {
    const trip = await this._prisma.communityTrip.findUnique({
      where: { slug },
      include: {
        community: {
          select: COMMUNITY_SELECT,
        },
      },
    });

    if (!trip || trip.deletedAt !== null) return null;
    return toCommunityTripWithOrganizer(trip as PrismaTripWithCommunity);
  }

  async update(
    id: string,
    data: Partial<CreateCommunityTripData>,
  ): Promise<CommunityTripModel> {
    const { communityId, price, ...rest } = data;
    const trip = await this._prisma.communityTrip.update({
      where: { id },
      data: {
        ...rest,
        category: rest.category
          ? (rest.category as unknown as $Enums.CommunityTripCategory)
          : undefined,
        pricingType: rest.pricingType
          ? (rest.pricingType as unknown as $Enums.CommunityTripPricingType)
          : undefined,
        price:
          price !== undefined && price !== null
            ? new Prisma.Decimal(price)
            : undefined,
      },
    });
    return toCommunityTripModel(trip);
  }

  async findManyWithFilters(
    filters: CommunityTripFilterCriteria,
  ): Promise<{ trips: CommunityTripWithOrganizer[]; total: number }> {
    const where: Prisma.CommunityTripWhereInput = {
      deletedAt: null,
      community: {
        deletedAt: null,
      },
    };

    if (filters.status) {
      where.status = filters.status as unknown as $Enums.CommunityTripStatus;
    } else {
      where.status = 'PUBLISHED';
    }

    if (filters.category) {
      where.category =
        filters.category as unknown as $Enums.CommunityTripCategory;
    }

    if (filters.pricingType) {
      where.pricingType =
        filters.pricingType as unknown as $Enums.CommunityTripPricingType;
    }

    if (filters.communityId) {
      where.communityId = filters.communityId;
    }

    if (filters.destination) {
      where.OR = [
        {
          destinationName: {
            contains: filters.destination,
            mode: 'insensitive',
          },
        },
        { city: { contains: filters.destination, mode: 'insensitive' } },
        { state: { contains: filters.destination, mode: 'insensitive' } },
      ];
    }

    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = filters.limit && filters.limit > 0 ? filters.limit : 12;
    const skip = (page - 1) * limit;

    const [trips, total] = await Promise.all([
      this._prisma.communityTrip.findMany({
        where,
        include: {
          community: {
            select: COMMUNITY_SELECT,
          },
        },
        orderBy: { dateFrom: 'asc' },
        skip,
        take: limit,
      }),
      this._prisma.communityTrip.count({ where }),
    ]);

    return {
      trips: (trips as PrismaTripWithCommunity[]).map(
        toCommunityTripWithOrganizer,
      ),
      total,
    };
  }

  async findByCommunityId(
    communityId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ trips: CommunityTripWithOrganizer[]; total: number }> {
    const skip = (page - 1) * limit;
    const where: Prisma.CommunityTripWhereInput = {
      communityId,
      deletedAt: null,
      community: {
        deletedAt: null,
      },
    };

    const [trips, total] = await Promise.all([
      this._prisma.communityTrip.findMany({
        where,
        include: {
          community: {
            select: COMMUNITY_SELECT,
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this._prisma.communityTrip.count({ where }),
    ]);

    return {
      trips: (trips as PrismaTripWithCommunity[]).map(
        toCommunityTripWithOrganizer,
      ),
      total,
    };
  }

  async incrementJoinedCount(tripId: string): Promise<void> {
    await this._prisma.communityTrip.update({
      where: { id: tripId },
      data: {
        joinedCount: { increment: 1 },
      },
    });
  }
}
