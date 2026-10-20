import { container } from 'tsyringe';
import { TOKENS } from '../../tokens';

import { RegisterCommunityUseCase } from '../../../../application/use-cases/community/register-community.usecase';
import { LoginCommunityUseCase } from '../../../../application/use-cases/community/login-community.usecase';
import { VerifyCommunityEmailUseCase } from '../../../../application/use-cases/community/verify-community-email.usecase';
import { ResendCommunityOtpUseCase } from '../../../../application/use-cases/community/resend-community-otp.usecase';
import { OnboardCommunityUseCase } from '../../../../application/use-cases/community/onboard-community.usecase';
import { SubmitCommunityVerificationUseCase } from '../../../../application/use-cases/community/submit-community-verification.usecase';
import { GetCommunityProfileUseCase } from '../../../../application/use-cases/community/get-community-profile.usecase';
import { RefreshCommunityTokenUseCase } from '../../../../application/use-cases/community/refresh-community-token.usecase';

import { CreateCommunityTripUseCase } from '../../../../application/use-cases/community/create-community-trip.usecase';
import { ListCommunityTripsUseCase } from '../../../../application/use-cases/community/list-community-trips.usecase';
import { GetCommunityTripDetailUseCase } from '../../../../application/use-cases/community/get-community-trip-detail.usecase';
import { GetOrganizerTripsUseCase } from '../../../../application/use-cases/community/get-organizer-trips.usecase';

import { JoinFreeCommunityTripUseCase } from '../../../../application/use-cases/community/join-free-community-trip.usecase';
import { CreateRazorpayBookingOrderUseCase } from '../../../../application/use-cases/community/create-razorpay-order.usecase';
import { VerifyRazorpayBookingUseCase } from '../../../../application/use-cases/community/verify-razorpay-booking.usecase';
import { GetUserCommunityBookingsUseCase } from '../../../../application/use-cases/community/get-user-community-bookings.usecase';
import { GetTripBookingsUseCase } from '../../../../application/use-cases/community/get-trip-bookings.usecase';

export function registerCommunityDependencies(): void {
  // Auth & Profile Use Cases
  container.registerSingleton(
    TOKENS.IRegisterCommunity,
    RegisterCommunityUseCase,
  );
  container.registerSingleton(TOKENS.ILoginCommunity, LoginCommunityUseCase);
  container.registerSingleton(
    TOKENS.IVerifyCommunityEmail,
    VerifyCommunityEmailUseCase,
  );
  container.registerSingleton(
    TOKENS.IResendCommunityOtp,
    ResendCommunityOtpUseCase,
  );
  container.registerSingleton(
    TOKENS.IOnboardCommunity,
    OnboardCommunityUseCase,
  );
  container.registerSingleton(
    TOKENS.ISubmitCommunityVerification,
    SubmitCommunityVerificationUseCase,
  );
  container.registerSingleton(
    TOKENS.IGetCommunityProfile,
    GetCommunityProfileUseCase,
  );
  container.registerSingleton(
    TOKENS.IRefreshCommunityToken,
    RefreshCommunityTokenUseCase,
  );

  // Trip Use Cases
  container.registerSingleton(
    TOKENS.ICreateCommunityTrip,
    CreateCommunityTripUseCase,
  );
  container.registerSingleton(
    TOKENS.IListCommunityTrips,
    ListCommunityTripsUseCase,
  );
  container.registerSingleton(
    TOKENS.IGetCommunityTripDetail,
    GetCommunityTripDetailUseCase,
  );
  container.registerSingleton(
    TOKENS.IGetOrganizerTrips,
    GetOrganizerTripsUseCase,
  );

  // Booking Use Cases
  container.registerSingleton(
    TOKENS.IJoinFreeCommunityTrip,
    JoinFreeCommunityTripUseCase,
  );
  container.registerSingleton(
    TOKENS.ICreateRazorpayBookingOrder,
    CreateRazorpayBookingOrderUseCase,
  );
  container.registerSingleton(
    TOKENS.IVerifyRazorpayBooking,
    VerifyRazorpayBookingUseCase,
  );
  container.registerSingleton(
    TOKENS.IGetUserCommunityBookings,
    GetUserCommunityBookingsUseCase,
  );
  container.registerSingleton(TOKENS.IGetTripBookings, GetTripBookingsUseCase);
}
