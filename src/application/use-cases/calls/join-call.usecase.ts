import { inject, injectable } from 'tsyringe';

import { IJoinCallUseCase } from '../../interfaces/use-cases/calls/join-call.interface';
import { IJoinDirectCallUseCase } from '../../interfaces/use-cases/calls/join-direct-call.interface';

import { TOKENS } from '../../../infrastructure/di/tokens';
import { CallDTO } from '../../dtos/call/request/call.dto';

@injectable()
export class JoinCallUseCase implements IJoinCallUseCase {
  constructor(
    @inject(TOKENS.IJoinDirectCallUseCase)
    private readonly joinDirectCallUseCase: IJoinDirectCallUseCase,
  ) {}

  async execute(callId: string, userId: string): Promise<CallDTO> {
    return this.joinDirectCallUseCase.execute(callId, userId);
  }
}
