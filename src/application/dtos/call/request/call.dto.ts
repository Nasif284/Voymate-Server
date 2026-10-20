export type CallMediaType = 'AUDIO' | 'VIDEO';
export type CallScope = 'DIRECT';
export type CallStatus = 'RINGING' | 'ACTIVE' | 'ENDED' | 'CANCELLED';
export type CallParticipantStatus =
  | 'INVITED'
  | 'JOINED'
  | 'DECLINED'
  | 'LEFT'
  | 'MISSED';

export interface CallParticipantDTO {
  id: string;
  userId: string;
  user?: {
    fullName: string;
    avatarUrl: string | null;
  };
  status: CallParticipantStatus;
  joinedAt: Date | null;
  leftAt: Date | null;
}

export interface CallDTO {
  id: string;
  scope: CallScope;
  mediaType: CallMediaType;
  status: CallStatus;

  callerId: string;
  recipientId: string | null;

  startedAt: Date | null;
  endedAt: Date | null;
  createdAt: Date;

  caller?: {
    fullName: string;
    avatarUrl: string | null;
  };
  participants?: CallParticipantDTO[];
}
