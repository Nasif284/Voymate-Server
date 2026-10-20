import {
  AccountStatus,
  OnlineStatus,
  ProfileVisibility,
  RequestFromOption,
  Gender,
  TravelType,
  TravelPersonality,
  MatchPreference,
  OnboardingSource,
} from '../../enums';

export interface UserPrivacy {
  profileVisibilityCode: ProfileVisibility;
  requestsFromCode: RequestFromOption;
  showOnlineStatus: boolean;
  showTravelingStatus: boolean;
}

export interface UserLocation {
  onlineStatusCode: OnlineStatus | null;
  lastSeenAt: Date | null;
  currentLat: number | null;
  currentLng: number | null;
  currentCity: string | null;
  currentCountryCode: string | null;
}

export interface UserOnboarding {
  onboardingStep: number;
  onboardingCompleted: boolean;
  onboardingSourceCode: OnboardingSource | null;
}

export interface UserProps {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  passwordHash: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  bio: string | null;
  dateOfBirth: Date | null;
  genderCode: Gender;
  country: string | null;
  travelTypeCode: TravelType;
  travelPersonalityCode: TravelPersonality;
  matchWithCode: MatchPreference;
  accountStatusCode: AccountStatus;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  isTraveling: boolean;
  isIdVerified: boolean;
  phoneVerifiedAt: Date | null;
  emailVerifiedAt: Date | null;
  idVerifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
  privacy?: UserPrivacy;
  location?: UserLocation;
  onboarding?: UserOnboarding;
}

export class User {
  readonly id: string;
  readonly fullName: string;
  readonly email: string;
  readonly phone: string | null;
  readonly passwordHash: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  readonly bio: string | null;
  readonly dateOfBirth: Date | null;
  readonly genderCode: Gender;
  readonly country: string | null;
  readonly travelTypeCode: TravelType;
  readonly travelPersonalityCode: TravelPersonality;
  readonly matchWithCode: MatchPreference;
  readonly accountStatusCode: AccountStatus;
  readonly isPhoneVerified: boolean;
  readonly isEmailVerified: boolean;
  readonly isTraveling: boolean;
  readonly isIdVerified: boolean;
  readonly phoneVerifiedAt: Date | null;
  readonly emailVerifiedAt: Date | null;
  readonly idVerifiedAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date | null;
  readonly deletedAt: Date | null;
  readonly privacy: UserPrivacy;
  readonly location: UserLocation;
  readonly onboarding: UserOnboarding;

  constructor(props: UserProps) {
    this.id = props.id;
    this.fullName = props.fullName;
    this.email = props.email;
    this.phone = props.phone;
    this.passwordHash = props.passwordHash;
    this.avatarUrl = props.avatarUrl;
    this.coverUrl = props.coverUrl;
    this.bio = props.bio;
    this.dateOfBirth = props.dateOfBirth;
    this.genderCode = props.genderCode;
    this.country = props.country;
    this.travelTypeCode = props.travelTypeCode;
    this.travelPersonalityCode = props.travelPersonalityCode;
    this.matchWithCode = props.matchWithCode;
    this.accountStatusCode = props.accountStatusCode;
    this.isPhoneVerified = props.isPhoneVerified;
    this.isEmailVerified = props.isEmailVerified;
    this.isTraveling = props.isTraveling;
    this.isIdVerified = props.isIdVerified;
    this.phoneVerifiedAt = props.phoneVerifiedAt;
    this.emailVerifiedAt = props.emailVerifiedAt;
    this.idVerifiedAt = props.idVerifiedAt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.deletedAt = props.deletedAt;

    this.privacy = props.privacy ?? {
      profileVisibilityCode: ProfileVisibility.EVERYONE,
      requestsFromCode: RequestFromOption.EVERYONE,
      showOnlineStatus: true,
      showTravelingStatus: false,
    };

    this.location = props.location ?? {
      onlineStatusCode: OnlineStatus.OFFLINE,
      lastSeenAt: null,
      currentLat: null,
      currentLng: null,
      currentCity: null,
      currentCountryCode: null,
    };
    this.onboarding = props.onboarding ?? {
      onboardingStep: 1,
      onboardingCompleted: false,
      onboardingSourceCode: null,
    };
  }

  isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  isActive(): boolean {
    return this.accountStatusCode === AccountStatus.ACTIVE;
  }

  canLogin(): boolean {
    return (
      this.accountStatusCode === AccountStatus.ACTIVE ||
      this.accountStatusCode === AccountStatus.SUSPENDED
    );
  }
  getAge(): number | null {
    if (!this.dateOfBirth) return null;
    const today = new Date();
    const dob = new Date(this.dateOfBirth);
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m == 0 && today.getDate() < dob.getDate())) age--;
    return age;
  }
  getOnlineStatusFor(isOwner: boolean): string | null {
    if (isOwner) return this.location.onlineStatusCode;
    if (!this.privacy.showOnlineStatus) return null;
    return this.location.onlineStatusCode;
  }
}
