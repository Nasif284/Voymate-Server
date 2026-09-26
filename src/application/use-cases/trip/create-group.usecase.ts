import { inject, injectable } from 'tsyringe';
import { ICreateGroup } from '../../interfaces/use-cases/trip/create-group.interface';
import { TOKENS } from '../../../infrastructure/di/tokens';
import { ITripGroupRepository } from '../../interfaces/repositories/trip-group.repository';
import { generateInviteCode } from '../../../shared/helpers/generateUniqueCode';

@injectable()
export class CreateGroup implements ICreateGroup {
  constructor(
    @inject(TOKENS.ITripGroupRepository)
    private readonly _tripGroupRepository: ITripGroupRepository,
  ) {}
  async execute(dto: { tripId: string; userId: string }): Promise<void> {
    const inviteCode = generateInviteCode();
    await this._tripGroupRepository.createGroup(
      dto.tripId,
      dto.userId,
      inviteCode,
    );
  }
}
