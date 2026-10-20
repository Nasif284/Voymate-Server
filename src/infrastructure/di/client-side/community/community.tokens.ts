export const COMMUNITY_TOKENS = {
  // Auth & Profile
  IRegisterCommunity: 'IRegisterCommunity',
  ILoginCommunity: 'ILoginCommunity',
  IVerifyCommunityEmail: 'IVerifyCommunityEmail',
  IResendCommunityOtp: 'IResendCommunityOtp',
  IOnboardCommunity: 'IOnboardCommunity',
  ISubmitCommunityVerification: 'ISubmitCommunityVerification',
  IGetCommunityProfile: 'IGetCommunityProfile',
  IRefreshCommunityToken: 'IRefreshCommunityToken',

  // Trips
  ICreateCommunityTrip: 'ICreateCommunityTrip',
  IListCommunityTrips: 'IListCommunityTrips',
  IGetCommunityTripDetail: 'IGetCommunityTripDetail',
  IGetOrganizerTrips: 'IGetOrganizerTrips',

  // Bookings
  IJoinFreeCommunityTrip: 'IJoinFreeCommunityTrip',
  ICreateRazorpayBookingOrder: 'ICreateRazorpayBookingOrder',
  IVerifyRazorpayBooking: 'IVerifyRazorpayBooking',
  IGetUserCommunityBookings: 'IGetUserCommunityBookings',
  IGetTripBookings: 'IGetTripBookings',
} as const;
