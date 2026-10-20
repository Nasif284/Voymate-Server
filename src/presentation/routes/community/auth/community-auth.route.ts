import { Router } from 'express';
import { CommunityAuthController } from '../../../controllers/community/community-auth.controller';
import { CommunityAuthMiddleware } from '../../../middleware/user/auth/communityAuth.middleware';
import { asyncHandler } from '../../../middleware/error/asyncHandler';
import { validate } from '../../../validators/validator';
import { upload } from '../../../middleware/storage/multer.middleware';
import {
  RegisterCommunitySchema,
  LoginCommunitySchema,
  VerifyCommunityEmailSchema,
  ResendCommunityOtpSchema,
  OnboardCommunitySchema,
  SubmitCommunityVerificationSchema,
} from '../../../validators/community/auth';

export function buildCommunityAuthRoutes(
  controller: CommunityAuthController,
  communityAuth: CommunityAuthMiddleware,
): Router {
  const router = Router();

  router.post(
    '/register',
    validate(RegisterCommunitySchema),
    asyncHandler(controller.register),
  );

  router.post(
    '/login',
    validate(LoginCommunitySchema),
    asyncHandler(controller.login),
  );

  router.post('/refresh', asyncHandler(controller.refreshToken));

  router.post(
    '/verify-email',
    validate(VerifyCommunityEmailSchema),
    asyncHandler(controller.verifyEmail),
  );

  router.post(
    '/resend-otp',
    validate(ResendCommunityOtpSchema),
    asyncHandler(controller.resendOtp),
  );

  router.post('/logout', asyncHandler(controller.logout));

  router.get('/me', communityAuth.authenticate, asyncHandler(controller.getMe));

  router.patch(
    '/onboard',
    communityAuth.authenticate,
    upload.fields([
      { name: 'avatar', maxCount: 1 },
      { name: 'cover', maxCount: 1 },
    ]),
    validate(OnboardCommunitySchema),
    asyncHandler(controller.onboard),
  );

  router.post(
    '/verify',
    communityAuth.authenticate,
    upload.single('document'),
    validate(SubmitCommunityVerificationSchema),
    asyncHandler(controller.submitVerification),
  );

  return router;
}
