import { Router } from 'express';
import { CommunityTripController } from '../../../controllers/community/community-trip.controller';
import { CommunityAuthMiddleware } from '../../../middleware/user/auth/communityAuth.middleware';
import { asyncHandler } from '../../../middleware/error/asyncHandler';
import { validate } from '../../../validators/validator';
import { upload } from '../../../middleware/storage/multer.middleware';
import {
  CreateCommunityTripSchema,
  ListCommunityTripsSchema,
} from '../../../validators/community/trip';

export function buildCommunityTripRoutes(
  controller: CommunityTripController,
  communityAuth: CommunityAuthMiddleware,
): Router {
  const router = Router();

  router.post(
    '/',
    communityAuth.authenticate,
    upload.array('gallery', 10),
    validate(CreateCommunityTripSchema),
    asyncHandler(controller.createTrip),
  );

  router.get(
    '/',
    validate(ListCommunityTripsSchema, 'query'),
    asyncHandler(controller.listTrips),
  );

  router.get(
    '/organizer/my-trips',
    communityAuth.authenticate,
    asyncHandler(controller.getOrganizerTrips),
  );

  router.get('/:slugOrId', asyncHandler(controller.getTripDetail));

  return router;
}
