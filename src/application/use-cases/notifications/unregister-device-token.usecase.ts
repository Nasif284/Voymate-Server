import { inject, injectable } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import { IDeviceTokenRepository } from '../../interfaces/repositories/device-token.repository.interface';
import { UnregisterDeviceTokenDTO } from '../../dtos/notifications/device-token.dto';

@injectable()
export class UnregisterDeviceTokenUseCase {
  constructor(
    @inject(TOKENS.IDeviceTokenRepository)
    private readonly deviceTokenRepo: IDeviceTokenRepository,
  ) {}

  async execute(dto: UnregisterDeviceTokenDTO): Promise<void> {
    await this.deviceTokenRepo.deactivateToken(dto.token);
  }
}
