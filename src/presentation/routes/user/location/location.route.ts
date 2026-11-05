import { Router } from 'express';
import { LocationController } from '../../../controllers/user/location/location.controller';
import { UserAuthMiddleware } from '../../../middleware/user/auth/userAuth.middleware';
import { asyncHandler } from '../../../middleware/error/asyncHandler';

export function buildLocationRoutes(
  controller: LocationController,
  userAuth: UserAuthMiddleware,
) {
  const router = Router();
  router.post(
    '/',
    userAuth.authenticate,
    asyncHandler(controller.updateLocation),
  );
  router.get('/', userAuth.authenticate, asyncHandler(controller.getLocation));
  router.post('/reverse-geocode', asyncHandler(controller.reverseGeoCode));
  router.post(
    '/places/autocomplete',
    userAuth.authenticate,
    asyncHandler(controller.placesAutocomplete),
  );
  router.get(
    '/places/:placeId',
    userAuth.authenticate,
    asyncHandler(controller.getPlaceDetails),
  );
  router.post(
    '/places/details',
    userAuth.authenticate,
    asyncHandler(controller.getPlaceDetails),
  );
  router.get('/catalog/countries', asyncHandler(controller.getCountries));
  router.get('/catalog/states', asyncHandler(controller.getStates));
  router.get('/catalog/cities', asyncHandler(controller.getCities));
  return router;
}
