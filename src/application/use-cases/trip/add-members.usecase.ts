import { inject, injectable } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import { IGroupMemberRepository } from '../../interfaces/repositories/group-member.repository';
import { IAddMembers } from '../../interfaces/use-cases/trip/add-members.interface';

@injectable()
export class AddMembers implements IAddMembers {
  constructor(
    @inject(TOKENS.IGroupMemberRepository)
    private readonly _groupMemberRepository: IGroupMemberRepository,
  ) {}
  async execute(dto: {
    members: string[];
    groupId: string;
    addedBy: string;
  }): Promise<void> {
    for (const m of dto.members) {
      await this._groupMemberRepository.addMember(m, dto.groupId, dto.addedBy);
    }
  }
}
