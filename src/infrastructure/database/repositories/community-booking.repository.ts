import { inject, injectable } from 'tsyringe';
import {
  CommunityTripBooking as PrismaCommunityTripBooking,
  Prisma,
  PrismaClient,
} from '@prisma/client';
import { TOKENS } from '../../di/tokens';
import {
  ICommunityBookingRepository,
  CreateCommunityBookingData,
  CommunityBookingModel,
  CommunityBookingWithTrip,
  CommunityBookingWithUser,
} from '../../../application/interfaces/repositories/community.repository';
import {
  CommunityTripCategory,
  CommunityTripPricingType,
} from '../../../domain/enums/community.constants';

type PrismaBookingWithTrip = PrismaCommunityTripBooking & {
  trip: {
    id: string;
    title: string;
    slug: string;
    category: string;
    destinationName: string;
    city: string;
    state: string;
    dateFrom: Date;
    dateTo: Date;
    durationText: string;
    gallery: string[];
    pricingType: string;
    price: Prisma.Decimal | null;
    currency: string;
    community: {
      id: string;
      name: string;
      slug: string;
      avatarUrl: string | null;
    };
  };
};

type PrismaBookingWithUser = PrismaCommunityTripBooking & {
  user: {
    id: string;
    fullName: string;
    email: string;
    avatarUrl: string | null;
    phone: string | null;
  };
};

function toCommunityBookingModel(
  b: PrismaCommunityTripBooking,
): CommunityBookingModel {
  return {
    id: b.id,
    bookingCode: b.bookingCode,
    tripId: b.tripId,
    userId: b.userId,
    contactName: b.contactName,
    contactPhone: b.contactPhone,
    emergencyPhone: b.emergencyPhone,
    note: b.note,
    amount: Number(b.amount),
    currency: b.currency,
    razorpayOrderId: b.razorpayOrderId,
    razorpayPaymentId: b.razorpayPaymentId,
    bookedAt: b.bookedAt,
    createdAt: b.createdAt,
  };
}

function toCommunityBookingWithTrip(
  b: PrismaBookingWithTrip,
): CommunityBookingWithTrip {
  return {
    ...toCommunityBookingModel(b),
    trip: {
      id: b.trip.id,
      title: b.trip.title,
      slug: b.trip.slug,
      category: b.trip.category as unknown as CommunityTripCategory,
      destinationName: b.trip.destinationName,
      city: b.trip.city,
      state: b.trip.state,
      dateFrom: b.trip.dateFrom,
      dateTo: b.trip.dateTo,
      durationText: b.trip.durationText,
      gallery: b.trip.gallery,
      pricingType: b.trip.pricingType as unknown as CommunityTripPricingType,
      price: b.trip.price ? Number(b.trip.price) : null,
      currency: b.trip.currency,
      community: b.trip.community,
    },
  };
}

function toCommunityBookingWithUser(
  b: PrismaBookingWithUser,
): CommunityBookingWithUser {
  return {
    ...toCommunityBookingModel(b),
    user: b.user,
  };
}

@injectable()
export class CommunityBookingRepository implements ICommunityBookingRepository {
  constructor(
    @inject(TOKENS.PrismaClient) private readonly _prisma: PrismaClient,
  ) {}

  async create(
    data: CreateCommunityBookingData,
  ): Promise<CommunityBookingModel> {
    const { tripId, userId, amount, ...rest } = data;
    const booking = await this._prisma.communityTripBooking.create({
      data: {
        ...rest,
        amount: new Prisma.Decimal(amount),
        trip: { connect: { id: tripId } },
        user: { connect: { id: userId } },
      },
    });

    return toCommunityBookingModel(booking);
  }

  async findById(id: string): Promise<CommunityBookingModel | null> {
    const b = await this._prisma.communityTripBooking.findUnique({
      where: { id },
    });
    return b ? toCommunityBookingModel(b) : null;
  }

  async findByBookingCode(code: string): Promise<CommunityBookingModel | null> {
    const b = await this._prisma.communityTripBooking.findUnique({
      where: { bookingCode: code },
    });
    return b ? toCommunityBookingModel(b) : null;
  }

  async findByTripAndUser(
    tripId: string,
    userId: string,
  ): Promise<CommunityBookingModel | null> {
    const b = await this._prisma.communityTripBooking.findUnique({
      where: {
        tripId_userId: {
          tripId,
          userId,
        },
      },
    });
    return b ? toCommunityBookingModel(b) : null;
  }

  async findByUserId(userId: string): Promise<CommunityBookingWithTrip[]> {
    const records = await this._prisma.communityTripBooking.findMany({
      where: { userId },
      include: {
        trip: {
          select: {
            id: true,
            title: true,
            slug: true,
            category: true,
            destinationName: true,
            city: true,
            state: true,
            dateFrom: true,
            dateTo: true,
            durationText: true,
            gallery: true,
            pricingType: true,
            price: true,
            currency: true,
            community: {
              select: {
                id: true,
                name: true,
                slug: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
      orderBy: { bookedAt: 'desc' },
    });

    return (records as PrismaBookingWithTrip[]).map(toCommunityBookingWithTrip);
  }

  async findByTripId(tripId: string): Promise<CommunityBookingWithUser[]> {
    const records = await this._prisma.communityTripBooking.findMany({
      where: { tripId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
            phone: true,
          },
        },
      },
      orderBy: { bookedAt: 'desc' },
    });

    return (records as PrismaBookingWithUser[]).map(toCommunityBookingWithUser);
  }
}
