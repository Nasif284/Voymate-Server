import 'reflect-metadata';
import { container } from 'tsyringe';
import { PrismaClient } from '@prisma/client';
import { Redis } from 'ioredis';

import { TOKENS } from './tokens';

import { UserRepository } from '../database/repositories/user.repository';
import { EmailService } from '../services/email.service';
import {
  BcryptHashService,
  JwtTokenService,
  RedisSessionService,
} from '../services';
import { RedisOtpService } from '../services/email-otp.service';
import { AdminRepository } from '../database/repositories/admin.respository';
import { registerUserAuthDependencies } from './client-side/user/auth.dependency';
import { registerAdminAuthDependencies } from './admin-side/admin/auth.dependency';
import { registerUsersManagementDependencies } from './admin-side/user-management/user-management.dependency';
import { registerOnboardingDependency } from './client-side/user/onbaording.dependency';
import { StorageService } from '../services/storage.service';
import { LookupRepository } from '../database/repositories/lookups.repository';
import { registerLookupDependency } from './lookup/lookup.dependency';
import { registerLocationDependency } from './client-side/user/location.dependency,';
import { GoogleGeocodingService } from '../services/geocode.service';
import { registerUserDependency } from './client-side/user/user.dependency';
import { TripRepository } from '../database/repositories/trip.repository';
import { ImageService } from '../services/image.service';
import { registerTripDependency } from './client-side/trip/trip.dependency';
import { registerConnectionDependency } from './client-side/user/connection.dependency';
import { registerProfileDependency } from './client-side/user/porfile.dependency';
import { registerCommunityDependencies } from './client-side/community/community.dependency';
import { CommunityRepository } from '../database/repositories/community.repository';
import { CommunityTripRepository } from '../database/repositories/community-trip.repository';
import { CommunityBookingRepository } from '../database/repositories/community-booking.repository';
import { RazorpayPaymentService } from '../services/razorpay.service';
import { CommunityAuthMiddleware } from '../../presentation/middleware/user/auth/communityAuth.middleware';
import { TwilioSmsService } from '../services/sms-service.service';
import { RedisPhoneOtpService } from '../services/phone-otp.service';
import { RedisCacheService } from '../services/redis-cache.service';
import { AdminAuthMiddleware } from '../../presentation/middleware/user/auth/adminAuthMiddleware';
import { UserAuthMiddleware } from '../../presentation/middleware/user/auth/userAuth.middleware';
import { registerAdminsDependencies } from './admin-side/admins-management/admins.dependency';
import { VerificationRepository } from '../database/repositories/verification.repository';
import { registerVerificationDependency } from './admin-side/verification-queue/dependency';
import { IVerificationQueueService } from '../../application/interfaces/services/verification-queue.service.interface';
import { BullMQVerificationQueueService } from '../services/BullMq-verification-queue.service';
import { IOcrService } from '../../application/interfaces/services/ocr.service.interface';
import { IDocumentAnalysisService } from '../../application/interfaces/services/doucment-analysis.service.interface';
import { GoogleDocumentAiService } from '../services/google-ocr.service';
import { IDocumentExtractionService } from '../../application/interfaces/services/document-extraction.service.interface';
import { DocumentExtractionService } from '../services/document-extraction.service';
import { RuleBasedDocumentAnalysisService } from '../services/DocumentAnalysis.service';
import { IAIModelService } from '../../application/interfaces/services/ai-model.service.interface';
import { OpenRouterAIModelService } from '../services/open-router-ai-model.service';
import { IPlacesService } from '../../application/interfaces/services/places.service.interface';
import { GooglePlacesService } from '../services/google-places.service';
import { GooglePlacesClient } from '../services/google-places-client.service';
import { IAssistantRepository } from '../../application/interfaces/repositories/ai-assistant.repository';
import { AssistantRepository } from '../database/repositories/ai-assistant.repository';
import { registerAiAssistantDependency } from './client-side/ai-assistant/dependency';
import { IChatRepository } from '../../application/interfaces/repositories/chat.repository';
import { ChatRepository } from '../database/repositories/chat.repository';
import { registerChatsDependency } from './client-side/chat/dependency';
import { ICallRepository } from '../../application/interfaces/repositories/call.repository.interface';
import { CallRepository } from '../database/repositories/call.repository';
import { registerCallDependency } from './client-side/call/dependency';
import { Server } from 'socket.io';
import { CallNotificationService } from '../services/call-notification.service';
import { ICallNotificationService } from '../../application/interfaces/services/call-notification.service.interface';
import { IAdminAnalyticsRepository } from '../../application/interfaces/repositories/admin-analytics.repository';
import { AdminAnalyticsRepository } from '../database/repositories/admin-analytics.repository';
import { registerAdminAnalyticsDependency } from './admin-side/admin-analytics/dependency';
import { IEmbeddingService } from '../../application/interfaces/services/embedding.service.interface';
import { LocalEmbeddingService } from '../services/ocal-embedding.service';
import { IPresenceService } from '../../application/interfaces/services/presence.service.interface';
import { PresenceService } from '../services/presence.service';

export function registerDependencies(
  db: PrismaClient,
  redis: Redis,
  io: Server,
): void {
  container.registerInstance<PrismaClient>(TOKENS.PrismaClient, db);
  container.registerInstance<Redis>(TOKENS.RedisClient, redis);
  container.registerInstance<Server>(TOKENS.Socket, io);

  container.registerSingleton<BcryptHashService>(
    TOKENS.IHashService,
    BcryptHashService,
  );
  container.registerSingleton<JwtTokenService>(
    TOKENS.ITokenService,
    JwtTokenService,
  );
  container.registerSingleton<RedisSessionService>(
    TOKENS.ISessionService,
    RedisSessionService,
  );
  container.registerSingleton<RedisOtpService>(
    TOKENS.IOtpService,
    RedisOtpService,
  );
  container.registerSingleton<EmailService>(TOKENS.IEmailService, EmailService);
  container.registerSingleton<StorageService>(
    TOKENS.IStorageService,
    StorageService,
  );
  container.registerSingleton<GoogleGeocodingService>(
    TOKENS.IGeocodeService,
    GoogleGeocodingService,
  );
  container.registerSingleton<ImageService>(TOKENS.IImageService, ImageService);
  container.registerSingleton<TwilioSmsService>(
    TOKENS.ISmsService,
    TwilioSmsService,
  );
  container.registerSingleton<RedisPhoneOtpService>(
    TOKENS.IPhoneOtpService,
    RedisPhoneOtpService,
  );
  container.registerSingleton<RedisCacheService>(
    TOKENS.ICacheService,
    RedisCacheService,
  );
  container.registerSingleton<IVerificationQueueService>(
    TOKENS.IVerificationQueueService,
    BullMQVerificationQueueService,
  );
  container.registerSingleton<IOcrService>(
    TOKENS.IOcrService,
    GoogleDocumentAiService,
  );
  container.registerSingleton<IDocumentAnalysisService>(
    TOKENS.IDocumentAnalysisService,
    RuleBasedDocumentAnalysisService,
  );
  container.registerSingleton<IDocumentExtractionService>(
    TOKENS.IDocumentExtractionService,
    DocumentExtractionService,
  );
  container.registerSingleton<IAIModelService>(
    TOKENS.IAIModelService,
    OpenRouterAIModelService,
  );
  container.registerSingleton<IPlacesService>(
    TOKENS.IPlacesService,
    GooglePlacesService,
  );
  container.registerSingleton(TOKENS.GooglePlacesClient, GooglePlacesClient);
  container.registerSingleton<ICallNotificationService>(
    TOKENS.ICallNotificationService,
    CallNotificationService,
  );
  container.registerSingleton<IEmbeddingService>(
    TOKENS.IEmbeddingService,
    LocalEmbeddingService,
  );
  container.registerSingleton<IPresenceService>(
    TOKENS.IPresenceService,
    PresenceService,
  );

  container.registerSingleton<RazorpayPaymentService>(
    TOKENS.IRazorpayPaymentService,
    RazorpayPaymentService,
  );

  container.registerSingleton<UserRepository>(
    TOKENS.IUserRepository,
    UserRepository,
  );
  container.registerSingleton<AdminRepository>(
    TOKENS.IAdminRepository,
    AdminRepository,
  );
  container.registerSingleton<LookupRepository>(
    TOKENS.ILookupRepository,
    LookupRepository,
  );
  container.registerSingleton<TripRepository>(
    TOKENS.ITripRepository,
    TripRepository,
  );
  container.registerSingleton<VerificationRepository>(
    TOKENS.IVerificationRepository,
    VerificationRepository,
  );
  container.registerSingleton<IAssistantRepository>(
    TOKENS.IAssistantRepository,
    AssistantRepository,
  );
  container.registerSingleton<IChatRepository>(
    TOKENS.IChatRepository,
    ChatRepository,
  );
  container.registerSingleton<ICallRepository>(
    TOKENS.ICallRepository,
    CallRepository,
  );
  container.registerSingleton<IAdminAnalyticsRepository>(
    TOKENS.IAdminAnalyticsRepository,
    AdminAnalyticsRepository,
  );
  container.registerSingleton<CommunityRepository>(
    TOKENS.ICommunityRepository,
    CommunityRepository,
  );
  container.registerSingleton<CommunityTripRepository>(
    TOKENS.ICommunityTripRepository,
    CommunityTripRepository,
  );
  container.registerSingleton<CommunityBookingRepository>(
    TOKENS.ICommunityBookingRepository,
    CommunityBookingRepository,
  );

  container.registerSingleton<AdminAuthMiddleware>(
    TOKENS.AdminAuthenticationMiddleware,
    AdminAuthMiddleware,
  );
  container.registerSingleton<UserAuthMiddleware>(
    TOKENS.UserAuthMiddleware,
    UserAuthMiddleware,
  );
  container.registerSingleton<CommunityAuthMiddleware>(
    TOKENS.CommunityAuthMiddleware,
    CommunityAuthMiddleware,
  );

  // admin use-cases injection
  registerAdminAuthDependencies();
  registerUsersManagementDependencies();
  registerLookupDependency();
  registerAdminsDependencies();
  registerVerificationDependency();
  registerAdminAnalyticsDependency();

  // user use-cases injection
  registerUserAuthDependencies();
  registerOnboardingDependency();
  registerLocationDependency();
  registerUserDependency();
  registerTripDependency();
  registerConnectionDependency();
  registerProfileDependency();
  registerAiAssistantDependency();
  registerChatsDependency();
  registerCallDependency();
  registerCommunityDependencies();
}
