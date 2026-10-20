import { Router } from 'express';
import { buildAdminAuthRoutes } from './auth/auth.route';
import { AdminControllers } from '../../../infrastructure/di/container';
import { buildUserManagementRoutes } from './user-management/user-management.route';
import { buildAdminsRoutes } from './admins/admins.route';
import { AdminAuthMiddleware } from '../../middleware/user/auth/adminAuthMiddleware';
import { buildVerificationsRoute } from './verification-queue/verification.route';
import { buildAdminAnalyticsRoutes } from './analytics/admin-analytics.route';

export function buildAdminRoutes(
  container: AdminControllers,
  adminAuth: AdminAuthMiddleware,
): Router {
  const router = Router();
  router.use(
    '/auth',
    buildAdminAuthRoutes(container.adminAuthController, adminAuth),
  );
  router.use(
    '/users',
    buildUserManagementRoutes(container.userManagementController, adminAuth),
  );
  router.use(
    '/admins',
    buildAdminsRoutes(container.adminsController, adminAuth),
  );
  router.use(
    '/verifications',
    buildVerificationsRoute(container.verificationController, adminAuth),
  );
  router.use(
    '/analytics',
    buildAdminAnalyticsRoutes(container.adminAnalyticsController, adminAuth),
  );
  return router;
}
