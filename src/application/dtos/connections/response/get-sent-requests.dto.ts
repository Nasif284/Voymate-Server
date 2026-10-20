interface ConnectionRequestData {
  id: string;
  status: string;
  message: string | null;
  matchId: string | null;
  createdAt: Date;
  receiver: {
    id: string;
    avatarUrl: string | null;
    fullName: string;
    state: string | null;
    country: string | null;
  };
}
export interface GetSentRequestsResponseDTO {
  requests: ConnectionRequestData[];
}
