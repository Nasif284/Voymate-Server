import { inject, injectable } from 'tsyringe';
import { Request, Response } from 'express';
import { TOKENS } from '../../../infrastructure/di/tokens';
import {
  IJoinFreeCommunityTripUseCase,
  ICreateRazorpayBookingOrderUseCase,
  IVerifyRazorpayBookingUseCase,
  IGetUserCommunityBookingsUseCase,
  IGetTripBookingsUseCase,
} from '../../../application/interfaces/use-cases/community';
import { HttpStatus } from '../../../domain/enums/HttpStatusCodes.constants';
import { ApiResponse } from '../../responses/common-response';
import { COMMUNITY_MESSAGES } from '../../../shared/constants/messages/success/community/community.messages';

import { UnauthorizedError } from '../../../domain/errors/auth.error';
import {
  UnauthorizedCommunityAccessError,
  CommunityTripNotFoundError,
} from '../../../domain/errors/community.error';

@injectable()
export class CommunityBookingController {
  constructor(
    @inject(TOKENS.IJoinFreeCommunityTrip)
    private readonly _joinFreeUseCase: IJoinFreeCommunityTripUseCase,
    @inject(TOKENS.ICreateRazorpayBookingOrder)
    private readonly _createOrderUseCase: ICreateRazorpayBookingOrderUseCase,
    @inject(TOKENS.IVerifyRazorpayBooking)
    private readonly _verifyPaymentUseCase: IVerifyRazorpayBookingUseCase,
    @inject(TOKENS.IGetUserCommunityBookings)
    private readonly _getUserBookingsUseCase: IGetUserCommunityBookingsUseCase,
    @inject(TOKENS.IGetTripBookings)
    private readonly _getTripBookingsUseCase: IGetTripBookingsUseCase,
  ) {}

  joinFreeTrip = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?.userId;
    if (!userId) {
      throw new UnauthorizedError();
    }

    const booking = await this._joinFreeUseCase.execute({
      ...req.body,
      userId,
    });

    return res
      .status(HttpStatus.CREATED)
      .json(ApiResponse.success(COMMUNITY_MESSAGES.TRIP_JOINED, booking));
  };

  createRazorpayOrder = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const userId = req.user?.userId;
    if (!userId) {
      throw new UnauthorizedError();
    }

    const order = await this._createOrderUseCase.execute({
      ...req.body,
      userId,
    });

    return res
      .status(HttpStatus.CREATED)
      .json(ApiResponse.success(COMMUNITY_MESSAGES.ORDER_CREATED, order));
  };

  verifyPayment = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?.userId;
    if (!userId) {
      throw new UnauthorizedError();
    }

    const booking = await this._verifyPaymentUseCase.execute({
      ...req.body,
      userId,
    });

    return res
      .status(HttpStatus.CREATED)
      .json(ApiResponse.success(COMMUNITY_MESSAGES.PAYMENT_VERIFIED, booking));
  };

  getUserBookings = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?.userId;
    if (!userId) {
      throw new UnauthorizedError();
    }

    const bookings = await this._getUserBookingsUseCase.execute(userId);

    return res
      .status(HttpStatus.OK)
      .json(ApiResponse.success(COMMUNITY_MESSAGES.BOOKINGS_FETCHED, bookings));
  };

  getTripBookings = async (req: Request, res: Response): Promise<Response> => {
    const communityId = req.user?.userId;
    if (!communityId) {
      throw new UnauthorizedCommunityAccessError();
    }

    const tripId = req.params.tripId as string;
    if (!tripId || tripId.trim().length === 0) {
      throw new CommunityTripNotFoundError();
    }

    const bookings = await this._getTripBookingsUseCase.execute({
      communityId,
      tripId: tripId.trim(),
    });

    return res
      .status(HttpStatus.OK)
      .json(ApiResponse.success(COMMUNITY_MESSAGES.BOOKINGS_FETCHED, bookings));
  };
}
