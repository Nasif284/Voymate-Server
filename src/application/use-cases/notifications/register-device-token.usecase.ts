import { inject, injectable } from 'tsyringe';
import { TOKENS } from '../../../infrastructure/di/tokens';
import { IDeviceTokenRepository } from '../../interfaces/repositories/device-token.repository.interface';
import { RegisterDeviceTokenDTO } from '../../dtos/notifications/device-token.dto';

@injectable()
export class RegisterDeviceTokenUseCase {
  constructor(
    @inject(TOKENS.IDeviceTokenRepository)
    private readonly deviceTokenRepo: IDeviceTokenRepository,
  ) {}

  async execute(userId: string, dto: RegisterDeviceTokenDTO): Promise<void> {
    await this.deviceTokenRepo.upsertToken({
      userId,
      token: dto.token,
      platform: dto.platform,
      deviceId: dto.deviceId,
    });
  }
}
