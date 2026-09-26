import { inject, injectable } from 'tsyringe';
import { IChangeMemberRole } from '../../interfaces/use-cases/trip/change-member-role.interface';
import { TOKENS } from '../../../infrastructure/di/tokens';
import { IGroupMemberRepository } from '../../interfaces/repositories/group-member.repository';

@injectable()
export class ChangeMemberRole implements IChangeMemberRole {
  constructor(
    @inject(TOKENS.IGroupMemberRepository)
    private readonly _groupMemberRepository: IGroupMemberRepository,
  ) {}
  async execute(dto: { groupId: string; memberId: string }): Promise<void> {
    return await this._groupMemberRepository.changeMemberRole(
      dto.groupId,
      dto.memberId,
    );
  }
}
