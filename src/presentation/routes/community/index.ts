import { Router } from 'express';
import { CommunityAuthController } from '../../controllers/community/community-auth.controller';
import { CommunityTripController } from '../../controllers/community/community-trip.controller';
import { CommunityBookingController } from '../../controllers/community/community-booking.controller';
import { CommunityAuthMiddleware } from '../../middleware/user/auth/communityAuth.middleware';
import { UserAuthMiddleware } from '../../middleware/user/auth/userAuth.middleware';
import { buildCommunityAuthRoutes } from './auth/community-auth.route';
import { buildCommunityTripRoutes } from './trip/community-trip.route';
import { buildCommunityBookingRoutes } from './booking/community-booking.route';

export function buildCommunityRoutes(
  authController: CommunityAuthController,
  tripController: CommunityTripController,
  bookingController: CommunityBookingController,
  communityAuth: CommunityAuthMiddleware,
  userAuth: UserAuthMiddleware,
): Router {
  const router = Router();

  router.use('/auth', buildCommunityAuthRoutes(authController, communityAuth));
  router.use('/trips', buildCommunityTripRoutes(tripController, communityAuth));
  router.use(
    '/bookings',
    buildCommunityBookingRoutes(bookingController, communityAuth, userAuth),
  );

  return router;
}
