import {
  CallDTO,
  CallMediaType,
  CallParticipantDTO,
  CallParticipantStatus,
  CallScope,
} from '../../dtos/call/request/call.dto';

export interface CreateCallData {
  scope: CallScope;
  mediaType: CallMediaType;
  callerId: string;
  recipientId?: string;
}

export interface CreateCallParticipantData {
  callId: string;
  userId: string;
  status: CallParticipantStatus;
}

export interface ICallRepository {
  createCall(data: CreateCallData): Promise<CallDTO>;
  createParticipant(
    data: CreateCallParticipantData,
  ): Promise<CallParticipantDTO>;
  createParticipants(data: CreateCallParticipantData[]): Promise<void>;
  findById(callId: string): Promise<CallDTO | null>;
  findParticipant(
    callId: string,
    userId: string,
  ): Promise<CallParticipantDTO | null>;
  updateParticipantStatus(
    callId: string,
    userId: string,
    status: string,
  ): Promise<CallParticipantDTO>;
  updateCallStatus(callId: string, status: string): Promise<CallDTO>;
  updateCallStarted(callId: string): Promise<CallDTO>;
  updateCallEnded(callId: string): Promise<CallDTO>;
  getParticipants(callId: string): Promise<CallParticipantDTO[]>;
  findByIdWithParticipants(callId: string): Promise<CallDTO | null>;
  updateParticipantJoined(
    callId: string,
    userId: string,
  ): Promise<CallParticipantDTO>;
  countJoinedParticipants(callId: string): Promise<number>;
}
