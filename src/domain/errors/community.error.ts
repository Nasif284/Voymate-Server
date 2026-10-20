import { AppError } from '../../presentation/Errors/app.error';
import { COMMUNITY_ERROR_CODES } from '../../shared/constants/error-codes/community.code';
import { COMMUNITY_ERROR_MESSAGES } from '../../shared/constants/messages/error/community.messages';
import { HttpStatus } from '../enums/HttpStatusCodes.constants';

export class CommunityNotFoundError extends AppError {
  constructor() {
    super(
      HttpStatus.NOT_FOUND,
      COMMUNITY_ERROR_CODES.COMMUNITY_NOT_FOUND,
      COMMUNITY_ERROR_MESSAGES.COMMUNITY_NOT_FOUND,
    );
  }
}

export class CommunityAlreadyExistsError extends AppError {
  constructor() {
    super(
      HttpStatus.CONFLICT,
      COMMUNITY_ERROR_CODES.COMMUNITY_ALREADY_EXISTS,
      COMMUNITY_ERROR_MESSAGES.COMMUNITY_ALREADY_EXISTS,
    );
  }
}

export class InvalidCommunityCredentialsError extends AppError {
  constructor() {
    super(
      HttpStatus.UNAUTHORIZED,
      COMMUNITY_ERROR_CODES.INVALID_CREDENTIALS,
      COMMUNITY_ERROR_MESSAGES.INVALID_CREDENTIALS,
    );
  }
}

export class CommunityTripNotFoundError extends AppError {
  constructor() {
    super(
      HttpStatus.NOT_FOUND,
      COMMUNITY_ERROR_CODES.COMMUNITY_TRIP_NOT_FOUND,
      COMMUNITY_ERROR_MESSAGES.COMMUNITY_TRIP_NOT_FOUND,
    );
  }
}

export class CommunityTripFullError extends AppError {
  constructor() {
    super(
      HttpStatus.BAD_REQUEST,
      COMMUNITY_ERROR_CODES.COMMUNITY_TRIP_FULL,
      COMMUNITY_ERROR_MESSAGES.COMMUNITY_TRIP_FULL,
    );
  }
}

export class CommunityTripAlreadyJoinedError extends AppError {
  constructor() {
    super(
      HttpStatus.CONFLICT,
      COMMUNITY_ERROR_CODES.ALREADY_JOINED,
      COMMUNITY_ERROR_MESSAGES.ALREADY_JOINED,
    );
  }
}

export class PaymentVerificationFailedError extends AppError {
  constructor() {
    super(
      HttpStatus.BAD_REQUEST,
      COMMUNITY_ERROR_CODES.PAYMENT_VERIFICATION_FAILED,
      COMMUNITY_ERROR_MESSAGES.PAYMENT_VERIFICATION_FAILED,
    );
  }
}

export class UnauthorizedCommunityAccessError extends AppError {
  constructor() {
    super(
      HttpStatus.FORBIDDEN,
      COMMUNITY_ERROR_CODES.UNAUTHORIZED_ACCESS,
      COMMUNITY_ERROR_MESSAGES.UNAUTHORIZED_ACCESS,
    );
  }
}

export class InvalidTripDatesError extends AppError {
  constructor(message: string = COMMUNITY_ERROR_MESSAGES.INVALID_TRIP_DATES) {
    super(
      HttpStatus.BAD_REQUEST,
      COMMUNITY_ERROR_CODES.INVALID_TRIP_DATES,
      message,
    );
  }
}

export class CommunityEmailNotVerifiedError extends AppError {
  constructor() {
    super(
      HttpStatus.FORBIDDEN,
      COMMUNITY_ERROR_CODES.COMMUNITY_EMAIL_NOT_VERIFIED,
      COMMUNITY_ERROR_MESSAGES.COMMUNITY_EMAIL_NOT_VERIFIED,
    );
  }
}

export class InvalidTripPriceError extends AppError {
  constructor() {
    super(
      HttpStatus.BAD_REQUEST,
      COMMUNITY_ERROR_CODES.INVALID_TRIP_PRICE,
      COMMUNITY_ERROR_MESSAGES.INVALID_TRIP_PRICE,
    );
  }
}

export class TripNotFreeError extends AppError {
  constructor(message: string = COMMUNITY_ERROR_MESSAGES.TRIP_NOT_FREE) {
    super(HttpStatus.BAD_REQUEST, COMMUNITY_ERROR_CODES.TRIP_NOT_FREE, message);
  }
}

export class TripNotPaidError extends AppError {
  constructor(message: string = COMMUNITY_ERROR_MESSAGES.TRIP_NOT_PAID) {
    super(HttpStatus.BAD_REQUEST, COMMUNITY_ERROR_CODES.TRIP_NOT_PAID, message);
  }
}

export class TripNotOpenError extends AppError {
  constructor(message: string = COMMUNITY_ERROR_MESSAGES.TRIP_NOT_OPEN) {
    super(HttpStatus.BAD_REQUEST, COMMUNITY_ERROR_CODES.TRIP_NOT_OPEN, message);
  }
}
