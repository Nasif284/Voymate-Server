import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';

import { TOKENS } from '../../../../infrastructure/di/tokens';
import { ICreateDirectCallUseCase } from '../../../../application/interfaces/use-cases/calls/create-direct-call.interface';
import { IJoinCallUseCase } from '../../../../application/interfaces/use-cases/calls/join-call.interface';
import { ILeaveCallUseCase } from '../../../../application/interfaces/use-cases/calls/leave-call.interface';
import { IDeclineDirectCallUseCase } from '../../../../application/interfaces/use-cases/calls/decline-direct-call.interface';
import { ICancelDirectCallUseCase } from '../../../../application/interfaces/use-cases/calls/cancel-direct-call.interface';

import { ApiResponse } from '../../../responses/common-response';
import { HttpStatus } from '../../../../domain/enums/HttpStatusCodes.constants';

@injectable()
export class CallController {
  constructor(
    @inject(TOKENS.ICreateDirectCallUseCase)
    private readonly createDirectCallUseCase: ICreateDirectCallUseCase,

    @inject(TOKENS.IJoinCallUseCase)
    private readonly joinCallUseCase: IJoinCallUseCase,

    @inject(TOKENS.ILeaveCallUseCase)
    private readonly leaveCallUseCase: ILeaveCallUseCase,

    @inject(TOKENS.IDeclineCallUseCase)
    private readonly declineCallUseCase: IDeclineDirectCallUseCase,

    @inject(TOKENS.ICancelCallUseCase)
    private readonly cancelCallUseCase: ICancelDirectCallUseCase,
  ) {}

  createDirectCall = async (req: Request, res: Response): Promise<Response> => {
    const callerId = req.user!.userId;
    const { recipientId, mediaType } = req.body;
    const call = await this.createDirectCallUseCase.execute(callerId, {
      recipientId,
      mediaType,
    });
    return res
      .status(HttpStatus.CREATED)
      .json(ApiResponse.success('Call created successfully.', { call }));
  };

  joinCall = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user!.userId;
    const { callId } = req.params;
    const call = await this.joinCallUseCase.execute(callId as string, userId);
    return res
      .status(HttpStatus.OK)
      .json(ApiResponse.success('Joined call successfully.', { call }));
  };

  declineCall = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user!.userId;
    const { callId } = req.params;

    const call = await this.declineCallUseCase.execute(
      callId as string,
      userId,
    );

    return res
      .status(HttpStatus.OK)
      .json(ApiResponse.success('Call declined successfully.', { call }));
  };

  cancelCall = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user!.userId;
    const { callId } = req.params;

    const call = await this.cancelCallUseCase.execute(callId as string, userId);

    return res
      .status(HttpStatus.OK)
      .json(ApiResponse.success('Call cancelled successfully.', { call }));
  };

  leaveCall = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user!.userId;
    const { callId } = req.params;

    const call = await this.leaveCallUseCase.execute(callId as string, userId);

    return res
      .status(HttpStatus.OK)
      .json(ApiResponse.success('Left call successfully.', { call }));
  };
}
