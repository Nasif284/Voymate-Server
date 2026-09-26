import { inject, injectable } from 'tsyringe';
import { IGetMembers } from '../../interfaces/use-cases/trip/get-memeber.usecase';
import { TOKENS } from '../../../infrastructure/di/tokens';
import { IGroupMemberRepository } from '../../interfaces/repositories/group-member.repository';
import { IStorageService } from '../../interfaces/services/storage.service.interface';
import { GetMembersResponseDTO } from '../../dtos/trip/responce/get-members.dto';

@injectable()
export class GetMembers implements IGetMembers {
  constructor(
    @inject(TOKENS.IGroupMemberRepository)
    private readonly _groupMemberRepository: IGroupMemberRepository,
    @inject(TOKENS.IStorageService)
    private readonly _storageService: IStorageService,
  ) {}

  async execute(dto: { groupId: string }): Promise<GetMembersResponseDTO> {
    const result = await this._groupMemberRepository.getMembers(dto.groupId);
    for (const m of result.members) {
      m.avatarUrl = await this._storageService.getSignedUrl(m.avatarUrl);
    }
    return { members: result.members };
  }
}
