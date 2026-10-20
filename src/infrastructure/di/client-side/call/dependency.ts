import { container } from 'tsyringe';
import { ICreateDirectCallUseCase } from '../../../../application/interfaces/use-cases/calls/create-direct-call.interface';
import { TOKENS } from '../../tokens';
import { CreateDirectCallUseCase } from '../../../../application/use-cases/calls/create-direct-call.use-case';
import { IJoinDirectCallUseCase } from '../../../../application/interfaces/use-cases/calls/join-direct-call.interface';
import { JoinDirectCallUseCase } from '../../../../application/use-cases/calls/join-direct-call.use-case';
import { IJoinCallUseCase } from '../../../../application/interfaces/use-cases/calls/join-call.interface';
import { JoinCallUseCase } from '../../../../application/use-cases/calls/join-call.usecase';
import { ILeaveCallUseCase } from '../../../../application/interfaces/use-cases/calls/leave-call.interface';
import { LeaveCallUseCase } from '../../../../application/use-cases/calls/leave-call.usecase';
import { DeclineDirectCallUseCase } from '../../../../application/use-cases/calls/decline-direct-call.usecase';
import { IDeclineDirectCallUseCase } from '../../../../application/interfaces/use-cases/calls/decline-direct-call.interface';
import { ICancelDirectCallUseCase } from '../../../../application/interfaces/use-cases/calls/cancel-direct-call.interface';
import { CancelDirectCallUseCase } from '../../../../application/use-cases/calls/cancel-direct-call.usecase';
import { IAuthorizeSignalingUseCase } from '../../../../application/interfaces/use-cases/calls/authorize-signaling.interface';
import { AuthorizeSignalingUseCase } from '../../../../application/use-cases/calls/authorize-signaling.usecase';

export function registerCallDependency() {
  container.registerSingleton<ICreateDirectCallUseCase>(
    TOKENS.ICreateDirectCallUseCase,
    CreateDirectCallUseCase,
  );
  container.registerSingleton<IJoinDirectCallUseCase>(
    TOKENS.IJoinDirectCallUseCase,
    JoinDirectCallUseCase,
  );
  container.registerSingleton<IJoinCallUseCase>(
    TOKENS.IJoinCallUseCase,
    JoinCallUseCase,
  );
  container.registerSingleton<ILeaveCallUseCase>(
    TOKENS.ILeaveCallUseCase,
    LeaveCallUseCase,
  );
  container.registerSingleton<IDeclineDirectCallUseCase>(
    TOKENS.IDeclineCallUseCase,
    DeclineDirectCallUseCase,
  );
  container.registerSingleton<ICancelDirectCallUseCase>(
    TOKENS.ICancelCallUseCase,
    CancelDirectCallUseCase,
  );
  container.registerSingleton<IAuthorizeSignalingUseCase>(
    TOKENS.IAuthorizeSignalingUseCase,
    AuthorizeSignalingUseCase,
  );
}
