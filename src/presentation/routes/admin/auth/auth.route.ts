import { Router } from 'express';
import { AdminAuthController } from '../../../controllers/admin/auth/admin.auth.controller';
import { asyncHandler } from '../../../middleware/error/asyncHandler';

import { AdminAuthMiddleware } from '../../../middleware/user/auth/adminAuthMiddleware';
import { AdminRoleType } from '../../../../domain/enums/admin-role.enum';

export function buildAdminAuthRoutes(
  controller: AdminAuthController,
  adminAuth: AdminAuthMiddleware,
): Router {
  const router = Router();
  router.post(
    '/create',
    adminAuth.authenticate,
    adminAuth.authorize(AdminRoleType.SUPER_ADMIN),
    asyncHandler(controller.create),
  );
  router.post('/login', asyncHandler(controller.login));
  router.post('/logout', asyncHandler(controller.logout));
  router.post('/refresh', asyncHandler(controller.refreshToken));
  return router;
}
