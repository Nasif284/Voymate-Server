import { inject, injectable } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import {
  ICommunityBookingRepository,
  ICommunityTripRepository,
} from '../../interfaces/repositories/community.repository';
import {
  IRazorpayPaymentService,
  RazorpayOrderResult,
} from '../../interfaces/services/razorpay.service.interface';
import { ICreateRazorpayBookingOrderUseCase } from '../../interfaces/use-cases/community/create-razorpay-booking-order.interface';
import { CreateRazorpayOrderRequestDTO } from '../../dtos/community/booking/request/create-razorpay-order.dto';
import {
  CommunityTripPricingType,
  CommunityTripStatus,
} from '../../../domain/enums/community.constants';
import {
  CommunityTripNotFoundError,
  CommunityTripFullError,
  CommunityTripAlreadyJoinedError,
  TripNotPaidError,
  TripNotOpenError,
} from '../../../domain/errors/community.error';

@injectable()
export class CreateRazorpayBookingOrderUseCase implements ICreateRazorpayBookingOrderUseCase {
  constructor(
    @inject(TOKENS.ICommunityTripRepository)
    private readonly _tripRepository: ICommunityTripRepository,
    @inject(TOKENS.ICommunityBookingRepository)
    private readonly _bookingRepository: ICommunityBookingRepository,
    @inject(TOKENS.IRazorpayPaymentService)
    private readonly _razorpayService: IRazorpayPaymentService,
  ) {}

  async execute(
    dto: CreateRazorpayOrderRequestDTO,
  ): Promise<RazorpayOrderResult> {
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

    if (
      trip.pricingType !== CommunityTripPricingType.PAID ||
      !trip.price ||
      Number(trip.price) <= 0
    ) {
      throw new TripNotPaidError();
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

    const amount = Number(trip.price);
    const receipt = `rcpt_${dto.tripId.slice(0, 8)}_${Date.now()}`;

    return this._razorpayService.createOrder({
      amount,
      currency: trip.currency || 'INR',
      receipt,
    });
  }
}
