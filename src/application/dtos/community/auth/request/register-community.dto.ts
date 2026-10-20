export interface RegisterCommunityRequestDTO {
  name: string;
  email: string;
  password: string;
  phone?: string;
  city?: string;
  state?: string;
}
