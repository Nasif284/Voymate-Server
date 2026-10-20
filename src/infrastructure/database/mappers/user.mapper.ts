// src/infrastructure/database/mappers/UserMapper.ts

import {
  Country,
  User as PrismaUser,
  UserOnboarding,
  UserPrivacy,
} from '@prisma/client';
import {
  AccountStatus,
  Gender,
  TravelType,
  TravelPersonality,
  MatchPreference,
  ProfileVisibility,
  RequestFromOption,
  OnboardingSource,
} from '../../../domain/enums';
import { User, UserProps } from '../../../domain/entities/user/user.entity';

type UserWithRelations = PrismaUser & {
  onboarding?: UserOnboarding | null;
  privacySettings?: UserPrivacy | null;
  country?: Country | null;
};

export class UserMapper {
  static toDomain(row: UserWithRelations): User {
    const props: UserProps = {
      id: row.id,
      fullName: row.fullName,
      email: row.email,
      phone: row.phone,
      passwordHash: row.passwordHash,
      avatarUrl: row.avatarUrl,
      coverUrl: row.coverUrl,
      bio: row.bio,
      dateOfBirth: row.dateOfBirth ? new Date(row.dateOfBirth) : null,
      genderCode: (row.gender as Gender) ?? null,
      country: row?.country?.name ?? null,
      travelTypeCode: (row.travelType as TravelType) ?? null,
      travelPersonalityCode:
        (row.travelPersonality as TravelPersonality) ?? null,
      matchWithCode:
        (row.matchPreference as MatchPreference) ?? MatchPreference.EVERYONE,
      accountStatusCode:
        (row.accountStatus as AccountStatus) ?? AccountStatus.ACTIVE,
      isPhoneVerified: row.isPhoneVerified ?? false,
      isEmailVerified: row.isEmailVerified ?? false,
      isIdVerified: row.isIdVerified ?? false,
      isTraveling: row.isTraveling,
      phoneVerifiedAt: row.phoneVerifiedAt,
      emailVerifiedAt: row.emailVerifiedAt,
      idVerifiedAt: row.idVerifiedAt,
      createdAt: row.createdAt!,
      updatedAt: row.updatedAt!,
      deletedAt: row.deletedAt,

      privacy: row.privacySettings
        ? {
            profileVisibilityCode:
              (row.privacySettings.profileVisibility as ProfileVisibility) ??
              ProfileVisibility.EVERYONE,
            requestsFromCode:
              (row.privacySettings.requestsFrom as RequestFromOption) ??
              RequestFromOption.EVERYONE,
            showOnlineStatus: row.privacySettings.showOnlineStatus ?? true,
            showTravelingStatus:
              row.privacySettings.showTravelingStatus ?? false,
          }
        : undefined,
      onboarding: row.onboarding
        ? {
            onboardingStep: row.onboarding.onboardingStep ?? 1,
            onboardingCompleted: row.onboarding.onboardingCompleted ?? false,
            onboardingSourceCode:
              (row.onboarding.onboardingSource as OnboardingSource) ?? null,
          }
        : undefined,
    };

    return new User(props);
  }
}
