export interface OnboardCommunityRequestDTO {
  communityId: string;
  tagline?: string;
  description?: string;
  city?: string;
  state?: string;
  country?: string;
  instagramHandle?: string;
  websiteUrl?: string;
  avatarBuffer?: Buffer;
  avatarMimeType?: string;
  coverBuffer?: Buffer;
  coverMimeType?: string;
}
