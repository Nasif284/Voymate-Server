import { Router } from 'express';
import { NotificationController } from '../../../controllers/user/notifications/notification.controller';
import { UserAuthMiddleware } from '../../../middleware/user/auth/userAuth.middleware';
import { asyncHandler } from '../../../middleware/error/asyncHandler';

export function buildNotificationRoutes(
  controller: NotificationController,
  userAuth: UserAuthMiddleware,
): Router {
  const router = Router();

  router.post(
    '/devices',
    userAuth.authenticate,
    asyncHandler(controller.registerDevice),
  );
  router.delete(
    '/devices',
    userAuth.authenticate,
    asyncHandler(controller.unregisterDevice),
  );

  router.get(
    '/',
    userAuth.authenticate,
    asyncHandler(controller.getNotifications),
  );
  router.get(
    '/unread-count',
    userAuth.authenticate,
    asyncHandler(controller.getUnreadCount),
  );

  router.patch(
    '/read-all',
    userAuth.authenticate,
    asyncHandler(controller.markAllAsRead),
  );
  router.patch(
    '/:id/read',
    userAuth.authenticate,
    asyncHandler(controller.markAsRead),
  );

  return router;
}
