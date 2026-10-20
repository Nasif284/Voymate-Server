import { inject, injectable } from 'tsyringe';
import { OnboardingSourceRequestDTO } from '../../dtos/onbaording/request/source.dto';
import { IOnboardingSource } from '../../interfaces/use-cases/onboarding/onboarding-source.interface';
import { TOKENS } from '../../../infrastructure/di/tokens';
import { IUserRepository } from '../../interfaces/repositories/user.reposetory';
@injectable()
export class OnboardingSource implements IOnboardingSource {
  constructor(
    @inject(TOKENS.IUserRepository)
    private readonly _userRepository: IUserRepository,
  ) {}
  async execute(dto: OnboardingSourceRequestDTO): Promise<void> {
    await this._userRepository.addUserOnboardingSource(dto);
  }
}
