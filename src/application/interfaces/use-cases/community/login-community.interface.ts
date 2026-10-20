import { LoginCommunityRequestDTO } from '../../../dtos/community/auth/request/login-community.dto';
import { LoginCommunityResponseDTO } from '../../../dtos/community/auth/response/login-community.dto';

export interface ILoginCommunityUseCase {
  execute(dto: LoginCommunityRequestDTO): Promise<LoginCommunityResponseDTO>;
}
