import { Router } from 'express';

import { CallController } from '../../../controllers/user/call/call.controller';
import { UserAuthMiddleware } from '../../../middleware/user/auth/userAuth.middleware';
import { asyncHandler } from '../../../middleware/error/asyncHandler';

export function buildCallRoutes(
  controller: CallController,
  auth: UserAuthMiddleware,
): Router {
  const router = Router();

  router.post(
    '/direct',
    auth.authenticate,
    asyncHandler(controller.createDirectCall),
  );

  router.post(
    '/:callId/join',
    auth.authenticate,
    asyncHandler(controller.joinCall),
  );

  router.post(
    '/:callId/decline',
    auth.authenticate,
    asyncHandler(controller.declineCall),
  );

  router.post(
    '/:callId/cancel',
    auth.authenticate,
    asyncHandler(controller.cancelCall),
  );

  router.post(
    '/:callId/leave',
    auth.authenticate,
    asyncHandler(controller.leaveCall),
  );

  return router;
}
