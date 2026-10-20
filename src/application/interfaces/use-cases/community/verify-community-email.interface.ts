import { VerifyCommunityEmailRequestDTO } from '../../../dtos/community/auth/request/verify-community-email.dto';
import { VerifyCommunityEmailResponseDTO } from '../../../dtos/community/auth/response/verify-community-email.dto';

export interface IVerifyCommunityEmailUseCase {
  execute(
    dto: VerifyCommunityEmailRequestDTO,
  ): Promise<VerifyCommunityEmailResponseDTO>;
}
