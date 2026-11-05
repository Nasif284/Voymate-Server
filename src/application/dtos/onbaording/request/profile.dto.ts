export interface OnboardingProfileRequestDTO {
  userId: string;
  about: string;
  dateOfBirth: Date;
  nationality: string;
  state: string;
  city: string;
  gender: string;
  travelSkills: string[];
  languages: string[];
  imageBuffer: Buffer;
  profMimeType: string;
  coverImageBuffer?: Buffer;
  coverMimeType?: string;
  defaultCoverUrl?: string;
}
