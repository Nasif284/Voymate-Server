export interface RegisterCommunityResponseDTO {
  accessToken: string;
  refreshToken: string;
  community: {
    id: string;
    name: string;
    slug: string;
    email: string;
    isEmailVerified: boolean;
  };
}
