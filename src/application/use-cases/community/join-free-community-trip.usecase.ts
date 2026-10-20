import { inject, injectable } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import {
  ICommunityBookingRepository,
  ICommunityTripRepository,
} from '../../interfaces/repositories/community.repository';
import { IJoinFreeCommunityTripUseCase } from '../../interfaces/use-cases/community/join-free-community-trip.interface';
import { JoinFreeCommunityTripRequestDTO } from '../../dtos/community/booking/request/join-free-community-trip.dto';
import { BookingResponseDTO } from '../../dtos/community/booking/response/booking-response.dto';
import {
  CommunityTripCategory,
  CommunityTripPricingType,
  CommunityTripStatus,
} from '../../../domain/enums/community.constants';
import {
  CommunityTripNotFoundError,
  CommunityTripFullError,
  CommunityTripAlreadyJoinedError,
  TripNotFreeError,
  TripNotOpenError,
} from '../../../domain/errors/community.error';

@injectable()
export class JoinFreeCommunityTripUseCase implements IJoinFreeCommunityTripUseCase {
  constructor(
    @inject(TOKENS.ICommunityTripRepository)
    private readonly _tripRepository: ICommunityTripRepository,
    @inject(TOKENS.ICommunityBookingRepository)
    private readonly _bookingRepository: ICommunityBookingRepository,
  ) {}

  async execute(
    dto: JoinFreeCommunityTripRequestDTO,
  ): Promise<BookingResponseDTO> {
    const trip = await this._tripRepository.findById(dto.tripId);
    if (!trip || trip.deletedAt !== null) {
      throw new CommunityTripNotFoundError();
    }

    if (trip.status !== CommunityTripStatus.PUBLISHED) {
      throw new TripNotOpenError('This trip is not open for bookings.');
    }

    if (new Date(trip.dateFrom).getTime() < Date.now()) {
      throw new TripNotOpenError('This trip has already started.');
    }

    if (trip.pricingType !== CommunityTripPricingType.FREE) {
      throw new TripNotFreeError();
    }

    if (trip.joinedCount >= trip.maxCapacity) {
      throw new CommunityTripFullError();
    }

    const existing = await this._bookingRepository.findByTripAndUser(
      dto.tripId,
      dto.userId,
    );
    if (existing) {
      throw new CommunityTripAlreadyJoinedError();
    }

    const shortId = trip.slug.slice(0, 8).toUpperCase();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingCode = `VM-${shortId}-${randomSuffix}`;

    const booking = await this._bookingRepository.create({
      bookingCode,
      tripId: dto.tripId,
      userId: dto.userId,
      contactName: dto.contactName.trim(),
      contactPhone: dto.contactPhone.trim(),
      emergencyPhone: dto.emergencyPhone?.trim() || null,
      note: dto.note?.trim() || null,
      amount: 0,
      currency: trip.currency || 'INR',
    });

    await this._tripRepository.incrementJoinedCount(dto.tripId);

    return {
      id: booking.id,
      bookingCode: booking.bookingCode,
      tripId: booking.tripId,
      userId: booking.userId,
      contactName: booking.contactName,
      contactPhone: booking.contactPhone,
      emergencyPhone: booking.emergencyPhone,
      note: booking.note,
      amount: Number(booking.amount),
      currency: booking.currency,
      razorpayOrderId: booking.razorpayOrderId,
      razorpayPaymentId: booking.razorpayPaymentId,
      bookedAt: booking.bookedAt,
    };
  }
}
