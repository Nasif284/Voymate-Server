import { Router } from 'express';
import { ProfileController } from '../../../controllers/user/profile/profile.controller';
import { UserAuthMiddleware } from '../../../middleware/user/auth/userAuth.middleware';
import { asyncHandler } from '../../../middleware/error/asyncHandler';
import { upload } from '../../../middleware/storage/multer.middleware';

export function buildProfileRoutes(
  controller: ProfileController,
  userAuth: UserAuthMiddleware,
): Router {
  const router = Router();
  router.patch(
    '/',
    userAuth.authenticate,
    asyncHandler(controller.updateProfile),
  );
  router.patch(
    '/avatar',
    userAuth.authenticate,
    upload.single('avatar'),
    asyncHandler(controller.updateAvatar),
  );
  router.patch(
    '/cover',
    userAuth.authenticate,
    upload.single('cover'),
    asyncHandler(controller.updateCover),
  );
  router.patch(
    '/settings',
    userAuth.authenticate,
    asyncHandler(controller.updateSettings),
  );
  router.get(
    '/settings',
    userAuth.authenticate,
    asyncHandler(controller.getSettings),
  );
  router.post(
    '/verify/documents',
    userAuth.authenticate,
    upload.fields([{ name: 'front' }, { name: 'back' }]),
    asyncHandler(controller.submitVerification),
  );
  router.get(
    '/verify/documents',
    userAuth.authenticate,
    asyncHandler(controller.getDocVerification),
  );
  router.delete(
    '/account',
    userAuth.authenticate,
    asyncHandler(controller.deleteAccount),
  );
  router.post(
    '/block',
    userAuth.authenticate,
    asyncHandler(controller.blockUser),
  );
  router.delete(
    '/block/:targetUserId',
    userAuth.authenticate,
    asyncHandler(controller.unblockUser),
  );
  router.get(
    '/blocked-users',
    userAuth.authenticate,
    asyncHandler(controller.getBlockedUsers),
  );
  router.post(
    '/report',
    userAuth.authenticate,
    asyncHandler(controller.reportUser),
  );
  return router;
}
