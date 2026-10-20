export interface SubmitCommunityVerificationRequestDTO {
  communityId: string;
  notes?: string;
  documentBuffer: Buffer;
  mimeType: string;
}
