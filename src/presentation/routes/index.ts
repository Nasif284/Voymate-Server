import { Router } from 'express';
import { AppContainer } from '../../infrastructure/di/container';
import { buildAuthRoutes } from './user/auth/auth.route';
import { buildAdminRoutes } from './admin';
import { buildOnboardingRoutes } from './user/onboarding/onboarding.route';
import { buildLookupRoutes } from './lookups/lookup.route';
import { buildLocationRoutes } from './user/location/location.route';
import { buildUsersRoute } from './user/users/users.route';
import { buildTripRoutes } from './trip/trip.route';
import { buildConnectionRoutes } from './user/connection/connection.route';
import { buildProfileRoutes } from './user/profile/profile.route';
import { buildAssistantRoute } from './user/ai-assistant/assistant.route';
import { buildChatRoutes } from './user/chat/chat.route';
import { buildCallRoutes } from './user/calls/call.route';
import { buildCommunityRoutes } from './community';

export function buildRoutes(container: AppContainer): Router {
  const router = Router();

  const userAuth = container.authMiddlewares.userAuthMiddleware;
  const adminAuth = container.authMiddlewares.adminAuthMiddleware;
  const communityAuth = container.authMiddlewares.communityAuthMiddleware;

  router.use('/auth', buildAuthRoutes(container.authController, userAuth));
  router.use(
    '/onboarding',
    buildOnboardingRoutes(container.onboardingController, userAuth),
  );
  router.use('/admin', buildAdminRoutes(container.adminControllers, adminAuth));

  router.use('/lookup', buildLookupRoutes(container.lookupController));
  router.use(
    '/location',
    buildLocationRoutes(container.locationController, userAuth),
  );
  router.use('/users', buildUsersRoute(container.usersController, userAuth));
  router.use('/trip', buildTripRoutes(container.tripController, userAuth));
  router.use(
    '/connection',
    buildConnectionRoutes(container.connectionsController, userAuth),
  );
  router.use(
    '/profile',
    buildProfileRoutes(container.profileController, userAuth),
  );
  router.use(
    '/ai/assistant',
    buildAssistantRoute(container.assistantController, userAuth),
  );
  router.use('/chat', buildChatRoutes(container.chatController, userAuth));
  router.use('/calls', buildCallRoutes(container.callController, userAuth));
  router.use(
    '/community',
    buildCommunityRoutes(
      container.communityControllers.communityAuthController,
      container.communityControllers.communityTripController,
      container.communityControllers.communityBookingController,
      communityAuth,
      userAuth,
    ),
  );
  return router;
}
