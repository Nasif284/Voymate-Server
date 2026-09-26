import { inject, injectable } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import { ITripGroupRepository } from '../../interfaces/repositories/trip-group.repository';
import { IJoinWithLink } from '../../interfaces/use-cases/trip/join-with-link.interface';

@injectable()
export class JoinWithLink implements IJoinWithLink {
  constructor(
    @inject(TOKENS.ITripGroupRepository)
    private readonly _tripGroupRepository: ITripGroupRepository,
  ) {}

  async execute(dto: {
    inviteCode: string;
    userId: string;
  }): Promise<{ groupId: string }> {
    return await this._tripGroupRepository.joinGroupByInviteCode(dto);
  }
}
