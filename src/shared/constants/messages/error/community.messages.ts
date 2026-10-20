export const COMMUNITY_ERROR_MESSAGES = {
  COMMUNITY_NOT_FOUND: 'Community organization not found.',
  COMMUNITY_ALREADY_EXISTS:
    'A community with this email or name already exists.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  COMMUNITY_TRIP_NOT_FOUND: 'Community trip not found.',
  COMMUNITY_TRIP_FULL: 'This trip has reached maximum capacity.',
  ALREADY_JOINED: 'You have already joined this trip.',
  PAYMENT_VERIFICATION_FAILED:
    'Razorpay payment verification failed. Invalid signature.',
  UNAUTHORIZED_ACCESS:
    'You are not authorized to perform this community action.',
  INVALID_TRIP_DATES: 'Trip end date must be after start date.',
  COMMUNITY_EMAIL_NOT_VERIFIED:
    'Please verify your community email address before performing this action.',
  INVALID_TRIP_PRICE: 'Paid trips must specify a price greater than 0.',
  TRIP_NOT_FREE: 'This trip is not free. Please complete payment to join.',
  TRIP_NOT_PAID: 'This trip is free. No payment is required to join.',
  TRIP_NOT_OPEN: 'This trip is not open for bookings.',
} as const;
