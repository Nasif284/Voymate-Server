import { RegisterCommunityRequestDTO } from '../../../dtos/community/auth/request/register-community.dto';
import { RegisterCommunityResponseDTO } from '../../../dtos/community/auth/response/register-community.dto';

export interface IRegisterCommunityUseCase {
  execute(
    dto: RegisterCommunityRequestDTO,
  ): Promise<RegisterCommunityResponseDTO>;
}
