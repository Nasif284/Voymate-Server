import { Router } from 'express';
import { CommunityBookingController } from '../../../controllers/community/community-booking.controller';
import { CommunityAuthMiddleware } from '../../../middleware/user/auth/communityAuth.middleware';
import { UserAuthMiddleware } from '../../../middleware/user/auth/userAuth.middleware';
import { asyncHandler } from '../../../middleware/error/asyncHandler';
import { validate } from '../../../validators/validator';
import {
  JoinFreeTripSchema,
  CreateRazorpayOrderSchema,
  VerifyRazorpayBookingSchema,
} from '../../../validators/community/booking';

export function buildCommunityBookingRoutes(
  controller: CommunityBookingController,
  communityAuth: CommunityAuthMiddleware,
  userAuth: UserAuthMiddleware,
): Router {
  const router = Router();

  router.post(
    '/join-free',
    userAuth.authenticate,
    validate(JoinFreeTripSchema),
    asyncHandler(controller.joinFreeTrip),
  );

  router.post(
    '/create-razorpay-order',
    userAuth.authenticate,
    validate(CreateRazorpayOrderSchema),
    asyncHandler(controller.createRazorpayOrder),
  );

  router.post(
    '/verify-payment',
    userAuth.authenticate,
    validate(VerifyRazorpayBookingSchema),
    asyncHandler(controller.verifyPayment),
  );

  router.get(
    '/my-bookings',
    userAuth.authenticate,
    asyncHandler(controller.getUserBookings),
  );

  router.get(
    '/trip/:tripId',
    communityAuth.authenticate,
    asyncHandler(controller.getTripBookings),
  );

  return router;
}
