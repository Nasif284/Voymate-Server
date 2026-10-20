import { inject, injectable } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import {
  ICommunityBookingRepository,
  ICommunityTripRepository,
} from '../../interfaces/repositories/community.repository';
import { IRazorpayPaymentService } from '../../interfaces/services/razorpay.service.interface';
import { IVerifyRazorpayBookingUseCase } from '../../interfaces/use-cases/community/verify-razorpay-booking.interface';
import { VerifyRazorpayBookingRequestDTO } from '../../dtos/community/booking/request/verify-razorpay-booking.dto';
import { BookingResponseDTO } from '../../dtos/community/booking/response/booking-response.dto';
import {
  CommunityTripPricingType,
  CommunityTripStatus,
} from '../../../domain/enums/community.constants';
import {
  CommunityTripNotFoundError,
  CommunityTripFullError,
  CommunityTripAlreadyJoinedError,
  PaymentVerificationFailedError,
  TripNotPaidError,
  TripNotOpenError,
} from '../../../domain/errors/community.error';

@injectable()
export class VerifyRazorpayBookingUseCase implements IVerifyRazorpayBookingUseCase {
  constructor(
    @inject(TOKENS.ICommunityTripRepository)
    private readonly _tripRepository: ICommunityTripRepository,
    @inject(TOKENS.ICommunityBookingRepository)
    private readonly _bookingRepository: ICommunityBookingRepository,
    @inject(TOKENS.IRazorpayPaymentService)
    private readonly _razorpayService: IRazorpayPaymentService,
  ) {}

  async execute(
    dto: VerifyRazorpayBookingRequestDTO,
  ): Promise<BookingResponseDTO> {
    const isValid = this._razorpayService.verifySignature({
      orderId: dto.razorpayOrderId,
      paymentId: dto.razorpayPaymentId,
      signature: dto.razorpaySignature,
    });

    if (!isValid) {
      throw new PaymentVerificationFailedError();
    }

    const trip = await this._tripRepository.findById(dto.tripId);
    if (!trip || trip.deletedAt !== null) {
      throw new CommunityTripNotFoundError();
    }

    if (trip.status !== CommunityTripStatus.PUBLISHED) {
      throw new TripNotOpenError('This trip is not open for bookings.');
    }

    if (trip.pricingType !== CommunityTripPricingType.PAID) {
      throw new TripNotPaidError('This trip is not a paid trip.');
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
    const amount = Number(trip.price) || 0;

    const booking = await this._bookingRepository.create({
      bookingCode,
      tripId: dto.tripId,
      userId: dto.userId,
      contactName: dto.contactName.trim(),
      contactPhone: dto.contactPhone.trim(),
      emergencyPhone: dto.emergencyPhone?.trim() || null,
      note: dto.note?.trim() || null,
      amount,
      currency: trip.currency || 'INR',
      razorpayOrderId: dto.razorpayOrderId,
      razorpayPaymentId: dto.razorpayPaymentId,
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
