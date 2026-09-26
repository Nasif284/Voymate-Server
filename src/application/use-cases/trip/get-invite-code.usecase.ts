import { inject, injectable } from 'tsyringe';
import { IGetInviteCode } from '../../interfaces/use-cases/trip/get-invite-code.interface';
import { TOKENS } from '../../../infrastructure/di/tokens';
import { ITripGroupRepository } from '../../interfaces/repositories/trip-group.repository';

@injectable()
export class GetInviteCode implements IGetInviteCode {
  constructor(
    @inject(TOKENS.ITripGroupRepository)
    private readonly _tripGroupRepository: ITripGroupRepository,
  ) {}
  async execute(dto: { groupId: string }): Promise<{ inviteCode: string }> {
    return await this._tripGroupRepository.getInviteCode(dto.groupId);
  }
}
