import { Router } from 'express';
import { asyncHandler } from '../../../middleware/error/asyncHandler';
import { UserManagementController } from '../../../controllers/admin/user-management/user-management.controller';
import { validate } from '../../../validators/user/auth';
import { ChangeStatusSchema } from '../../../validators/user-management/change-status.validator';
import { AdminAuthMiddleware } from '../../../middleware/user/auth/adminAuthMiddleware';

import { AdminRoleType } from '../../../../domain/enums/admin-role.enum';

export function buildUserManagementRoutes(
  controller: UserManagementController,
  adminAuth: AdminAuthMiddleware,
): Router {
  const router = Router();
  router.get(
    '/:id',
    adminAuth.authenticate,
    asyncHandler(controller.getUserProfile),
  );
  router.get('/', adminAuth.authenticate, asyncHandler(controller.getAllUsers));
  router.patch(
    '/status',
    adminAuth.authenticate,
    adminAuth.authorize(AdminRoleType.SUPER_ADMIN, AdminRoleType.MODERATOR),
    validate(ChangeStatusSchema),
    asyncHandler(controller.changeUserStatus),
  );
  return router;
}
