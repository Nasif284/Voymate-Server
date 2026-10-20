export interface SendConnectionRequestDTO {
  senderId: string;
  receiverId: string;
  message: string;
  matchId?: string;
}
