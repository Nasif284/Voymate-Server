import { GetMembersResponseDTO } from '../../dtos/trip/responce/get-members.dto';

export interface IGroupMemberRepository {
  addMember(userId: string, groupId: string, addedBy: string): Promise<void>;
  getMembers(groupId: string): Promise<GetMembersResponseDTO>;
  changeMemberRole(groupId: string, memberId: string): Promise<void>;
  removeFromGroup(
    groupId: string,
    memberId: string,
    userId?: string,
  ): Promise<void>;
  findActiveMember(
    groupId: string,
    userId: string,
  ): Promise<{ id: string } | null>;
}
