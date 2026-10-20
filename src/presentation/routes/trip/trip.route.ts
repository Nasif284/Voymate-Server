import { Router } from 'express';
import { UserAuthMiddleware } from '../../middleware/user/auth/userAuth.middleware';
import { asyncHandler } from '../../middleware/error/asyncHandler';
import { TripController } from '../../controllers/trip/trip.controller';

export function buildTripRoutes(
  controller: TripController,
  userAuth: UserAuthMiddleware,
): Router {
  const router = Router();

  router.post('/', userAuth.authenticate, asyncHandler(controller.createTrip));
  router.patch(
    '/:id',
    userAuth.authenticate,
    asyncHandler(controller.editTrip),
  );
  router.patch(
    '/delete/:id',
    userAuth.authenticate,
    asyncHandler(controller.deleteTrip),
  );
  router.get(
    '/matches/search',
    userAuth.authenticate,
    asyncHandler(controller.searchTripMatches),
  );
  router.get(
    '/all-matches',
    userAuth.authenticate,
    asyncHandler(controller.getAllTripMatches),
  );
  router.get(
    '/matches/all',
    userAuth.authenticate,
    asyncHandler(controller.getAllTripMatches),
  );
  router.get(
    '/matches/:tripId',
    userAuth.authenticate,
    asyncHandler(controller.getTripMatches),
  );
  router.get(
    '/matches/profile/:matchId',
    userAuth.authenticate,
    asyncHandler(controller.getMatchProfile),
  );
  router.get(
    '/buddies-upcoming',
    userAuth.authenticate,
    asyncHandler(controller.getBuddiesUpcomingTrips),
  );
  router.get(
    '/active',
    userAuth.authenticate,
    asyncHandler(controller.getActiveTrip),
  );

  router.get(
    '/upcoming',
    userAuth.authenticate,
    asyncHandler(controller.getUserTrips),
  );
  router.get('/upcoming/:id', asyncHandler(controller.getUpcomingTrip));
  router.get(
    '/past',
    userAuth.authenticate,
    asyncHandler(controller.getUserPastTrip),
  );
  router.get('/past/:id', asyncHandler(controller.getPastTrip));

  return router;
}
