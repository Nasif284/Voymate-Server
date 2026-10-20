import { ADMIN_TOKENS } from './admin-side/admin/admin.tokens';
import { LOOKUP_TOKENS } from './lookup/lookup.tokens';
import { TRIP_TOKENS } from './client-side/trip/tokens';
import { USER_TOKENS } from './client-side/user/user.tokens';
import { VERIFICATION_TOKENS } from './admin-side/verification-queue/verification.tokens';
import { AI_ASSISTANT_TOKENS } from './client-side/ai-assistant/tokens';
import { CHAT_TOKENS } from './client-side/chat/tokens';
import { CALL_TOKENS } from './client-side/call/tokens';
import { ADMIN_ANALYTICS_TOKENS } from './admin-side/admin-analytics/tokens';
import { COMMUNITY_TOKENS } from './client-side/community/community.tokens';

export const TOKENS = {
  IUserRepository: 'IUserRepository',
  IAdminRepository: 'IAdminRepository',
  ILookupRepository: 'ILookupRepository',
  IVerificationRepository: 'IVerificationRepository',
  IAssistantRepository: 'IAssistantRepository',
  IChatRepository: 'IChatRepository',
  ICallRepository: 'ICallRepository',
  IAdminAnalyticsRepository: 'IAdminAnalyticsRepository',
  ICommunityRepository: 'ICommunityRepository',
  ICommunityTripRepository: 'ICommunityTripRepository',
  ICommunityBookingRepository: 'ICommunityBookingRepository',

  AdminAuthenticationMiddleware: 'AdminAuthenticationMiddleware',
  UserAuthMiddleware: 'UserAuthMiddleware',
  CommunityAuthMiddleware: 'CommunityAuthMiddleware',

  IHashService: 'IHashService',
  ITokenService: 'ITokenService',
  ISessionService: 'ISessionService',
  IOtpService: 'IOtpService',
  IEmailService: 'IEmailService',
  IStorageService: 'IStorageService',
  IGeocodeService: 'IGeocodeService',
  IImageService: 'IImageService',
  IPhoneOtpService: 'IPhoneOtpService',
  ISmsService: 'ISmsService',
  ICacheService: 'ICacheService',
  IVerificationQueueService: 'IVerificationQueueService',
  IOcrService: 'IOcrService',
  IDocumentAnalysisService: 'IDocumentAnalysisService',
  IDocumentExtractionService: 'IDocumentExtractionService',
  IAIModelService: 'IAIModelService',
  IPlacesService: 'IPlacesService',
  GooglePlacesClient: 'GooglePlacesClient',
  ICallNotificationService: 'ICallNotificationService',
  IEmbeddingService: 'IEmbeddingService',
  IPresenceService: 'IPresenceService',
  IMatchingEngine: 'IMatchingEngine',
  IRazorpayPaymentService: 'IRazorpayPaymentService',

  PrismaClient: 'PrismaClient',
  RedisClient: 'RedisClient',
  Socket: 'Socket',

  ...USER_TOKENS,
  ...ADMIN_TOKENS,
  ...LOOKUP_TOKENS,
  ...TRIP_TOKENS,
  ...VERIFICATION_TOKENS,
  ...AI_ASSISTANT_TOKENS,
  ...CHAT_TOKENS,
  ...CALL_TOKENS,
  ...ADMIN_ANALYTICS_TOKENS,
  ...COMMUNITY_TOKENS,
} as const;
