import { inject, injectable } from 'tsyringe';
import { IRemoveMember } from '../../interfaces/use-cases/trip/remove-member.inteface';
import { IGroupMemberRepository } from '../../interfaces/repositories/group-member.repository';
import { TOKENS } from '../../../infrastructure/di/tokens';

@injectable()
export class RemoveMember implements IRemoveMember {
  constructor(
    @inject(TOKENS.IGroupMemberRepository)
    private readonly _groupMemberRepository: IGroupMemberRepository,
  ) {}
  async execute(dto: {
    groupId: string;
    memberId: string;
    userId: string;
  }): Promise<void> {
    return await this._groupMemberRepository.removeFromGroup(
      dto.groupId,
      dto.memberId,
    );
  }
}
