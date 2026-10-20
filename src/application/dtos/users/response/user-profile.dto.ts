export interface GetUserProfileResponseDTO {
  id: string;
  fullName: string;
  status: string;
  bio: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  phone: string | null;
  isPhoneVerified: boolean;
  dob: Date;
  age: number | null;
  city: string | null;
  state: string | null;
  country: string | null;
  travelType: string | null;
  travelPersonality: string | null;
  gender: string | null;
  isTraveling: boolean;
  isEmailVerified: boolean;
  interests: string[];
  skills: string[];
  languages: string[];
  createdAt: Date;
  onboardingCompleted: boolean;
  onboardingStep: number;
  onboardingSource: string | null;
  matchWith: string;
  tripCount: number;
  connectionsCount: number;
  match?: {
    totalPoints: number;
    reasons: string[];
  } | null;
}
