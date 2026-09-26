import { GetGroupsRequestDTO } from '../../dtos/trip/request/get-all-groups.dto';
import { GetAllGroupsResponseDTO } from '../../dtos/trip/responce/get-all-groups.dto';
import {
  GetGroupsResponseDTO,
  GroupData,
} from '../../dtos/trip/responce/get-groups.dto';
import { GetGroupInvitesResponse } from '../../dtos/trip/responce/get-invites.dto';

export interface GroupTripForAI {
  startDate: Date;
  endDate: Date;
  budgetStyle: string;
  travelStyle: string;
  travellers: number;
  destination: {
    placeId: string;
    name: string;
    city: string | null;
    state: string | null;
    country: string;
    latitude: number;
    longitude: number;
  };
}

export interface ITripGroupRepository {
  createGroup(
    tripId: string,
    userId: string,
    inviteCode: string,
  ): Promise<void>;
  getActiveGroups(userId: string): Promise<GroupData[]>;
  getInviteCode(groupId: string): Promise<{ inviteCode: string }>;
  createGroupInvite(payload: {
    groupId: string;
    invitedBy: string;
    invitedUserEmail: string;
  }): Promise<void>;
  getGroupWithTrip(groupId: string): Promise<{
    inviteCode: string;
    groupName: string;
    destination: string;
  }>;
  joinGroupByInviteCode(payload: {
    inviteCode: string;
    userId: string;
  }): Promise<{ groupId: string }>;
  GetGroupWithDetails(groupId: string): Promise<GroupData>;
  getGroupInvites(groupId: string): Promise<GetGroupInvitesResponse>;
  getAllTripGroups(
    payload: GetGroupsRequestDTO,
  ): Promise<GetAllGroupsResponseDTO>;
  getUserTripGroups(userId: string): Promise<GetGroupsResponseDTO>;
  getGroupTrip(groupId: string): Promise<GroupTripForAI | null>;
}
