export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  BANNED = 'BANNED',
  DEACTIVATED = 'DEACTIVATED',
}
export enum OnlineStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  AWAY = 'AWAY',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  NON_BINARY = 'NON_BINARY',
}

export enum TravelType {
  BUDGET = 'BUDGET',
  BACKPACKER = 'BACKPACKER',
  LUXURY = 'LUXURY',
}

export enum TravelPersonality {
  INTROVERT = 'INTROVERT',
  AMBIVERT = 'AMBIVERT',
  EXTROVERT = 'EXTROVERT',
}

export enum MatchPreference {
  MEN = 'MEN',
  WOMEN = 'WOMEN',
  EVERYONE = 'EVERYONE',
}

export enum ProfileVisibility {
  EVERYONE = 'EVERYONE',
  VERIFIED_ONLY = 'VERIFIED_ONLY',
  CONNECTED_ONLY = 'CONNECTED_ONLY',
}

export enum RequestFromOption {
  EVERYONE = 'EVERYONE',
  VERIFIED_ONLY = 'VERIFIED_ONLY',
  NOBODY = 'NOBODY',
}

export enum OnboardingSource {
  FRIENDS_FAMILY = 'FRIENDS_FAMILY',
  SOCIAL_MEDIA = 'SOCIAL_MEDIA',
  SEARCH_ENGINE = 'SEARCH_ENGINE',
  TRAVEL_BLOG = 'TRAVEL_BLOG',
  APP_STORE = 'APP_STORE',
  OTHER = 'OTHER',
}

export type OtpPurpose = 'phone_verify' | 'password_reset' | 'email_verify';
