import { inject, injectable } from 'tsyringe';
import { TOKENS } from '../../../../infrastructure/di/tokens';
import { IUpdateProfile } from '../../../../application/interfaces/use-cases/profile/update-profile.interface';
import { IUpdateAvatar } from '../../../../application/interfaces/use-cases/profile/update-avatar.interface';
import { IUpdateCover } from '../../../../application/interfaces/use-cases/profile/update-cover.interface';
import { Request, Response } from 'express';
import { HttpStatus } from '../../../../domain/enums/HttpStatusCodes.constants';
import { ApiResponse } from '../../../responses/common-response';
import { PROFILE_MESSAGES } from '../../../../shared/constants/messages/success/user/profile.messages';
import { IUpdateSettings } from '../../../../application/interfaces/use-cases/profile/settings-update.interface';
import { IGetSettings } from '../../../../application/interfaces/use-cases/profile/get-settings.interface';
import { ISubmitVerificationUseCase } from '../../../../application/interfaces/use-cases/profile/doc-verification.interface';
import { SubmitVerificationRequestDTO } from '../../../../application/dtos/profile/request/doc-verification.dto';
import { IGetDocVerification } from '../../../../application/interfaces/use-cases/profile/get-doc-verification.interface';
import { IUserRepository } from '../../../../application/interfaces/repositories/user.reposetory';
import { ISafetyRepository } from '../../../../application/interfaces/repositories/safety.repository.interface';
import logger from '../../../../infrastructure/logging/logger';

@injectable()
export class ProfileController {
  constructor(
    @inject(TOKENS.IUpdateProfile)
    private readonly _updateProfile: IUpdateProfile,
    @inject(TOKENS.IUpdateAvatar) private readonly _updateAvatar: IUpdateAvatar,
    @inject(TOKENS.IUpdateCover) private readonly _updateCover: IUpdateCover,
    @inject(TOKENS.IUpdateSettings)
    private readonly _updateSettings: IUpdateSettings,
    @inject(TOKENS.IGetSettings)
    private readonly _getSettings: IGetSettings,
    @inject(TOKENS.ISubmitVerificationUseCase)
    private readonly _submitVerification: ISubmitVerificationUseCase,
    @inject(TOKENS.IGetDocVerification)
    private readonly _getDocVerification: IGetDocVerification,
    @inject(TOKENS.IUserRepository)
    private readonly _userRepository: IUserRepository,
    @inject(TOKENS.ISafetyRepository)
    private readonly _safetyRepository: ISafetyRepository,
  ) {}
  updateProfile = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?.userId;
    await this._updateProfile.execute({ userId: userId!, payload: req.body });
    return res
      .status(HttpStatus.OK)
      .json(ApiResponse.success(PROFILE_MESSAGES.PROFILE_UPDATED));
  };
  updateAvatar = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?.userId;
    const file = req.file;
    const buffer = file?.buffer;
    const mimeType = file?.mimetype;

    await this._updateAvatar.execute({
      userId: userId!,
      file: buffer!,
      mimeType: mimeType!,
    });
    return res
      .status(HttpStatus.OK)
      .json(ApiResponse.success(PROFILE_MESSAGES.AVATAR_UPDATED));
  };
  updateCover = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?.userId;
    const file = req.file;
    const buffer = file?.buffer;
    const mimeType = file?.mimetype;

    await this._updateCover.execute({
      userId: userId!,
      file: buffer!,
      mimeType: mimeType!,
    });
    return res
      .status(HttpStatus.OK)
      .json(ApiResponse.success(PROFILE_MESSAGES.COVER_UPDATED));
  };

  updateSettings = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?.userId;
    await this._updateSettings.execute({ userId: userId!, payload: req.body });
    return res
      .status(HttpStatus.OK)
      .json(ApiResponse.success(PROFILE_MESSAGES.SETTINGS_UPDATED));
  };
  getSettings = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?.userId;
    const data = await this._getSettings.execute({ userId: userId! });
    return res
      .status(HttpStatus.OK)
      .json(ApiResponse.success(PROFILE_MESSAGES.FETCHED_SETTINGS, data));
  };
  submitVerification = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const userid = req.user?.userId;
    const files = req.files as {
      front?: Express.Multer.File[];
      back?: Express.Multer.File[];
    };
    const uploadedDocuments = [];
    if (files.front?.length) {
      const file = files.front[0];
      uploadedDocuments.push({
        sideCode: 'front',
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        buffer: file.buffer,
      });
    }
    if (files.back?.length) {
      const file = files.back[0];
      uploadedDocuments.push({
        sideCode: 'back',
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        buffer: file.buffer,
      });
    }
    const dto: SubmitVerificationRequestDTO = {
      userId: userid!,
      documentTypeCode: req.body.documentTypeCode,
      uploadedDocuments,
    };

    const data = await this._submitVerification.execute(dto);
    return res
      .status(HttpStatus.CREATED)
      .json(ApiResponse.success(PROFILE_MESSAGES.DOCUMENTS_SUBMITTER, data));
  };

  getDocVerification = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const userId = req.user?.userId;
    const result = await this._getDocVerification.execute({
      userId: userId!,
    });
    return res
      .status(HttpStatus.OK)
      .json(ApiResponse.success(PROFILE_MESSAGES.GET_DOC_VERIFICATION, result));
  };

  deleteAccount = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?.userId;
    if (!userId) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(ApiResponse.error('UNAUTHORIZED', 'User not authenticated'));
    }
    await this._userRepository.deleteAccount(userId);
    logger.info(`User ${userId} deleted their account`);
    return res
      .status(HttpStatus.OK)
      .json(ApiResponse.success('Account successfully deleted'));
  };

  blockUser = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?.userId;
    const { targetUserId } = req.body;
    if (!userId) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(ApiResponse.error('UNAUTHORIZED', 'User not authenticated'));
    }
    if (!targetUserId) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponse.error('INVALID_REQUEST', 'targetUserId is required'));
    }
    await this._safetyRepository.blockUser(userId, targetUserId);
    return res
      .status(HttpStatus.OK)
      .json(ApiResponse.success('User blocked successfully'));
  };

  unblockUser = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?.userId;
    const targetUserId = req.params.targetUserId || req.body.targetUserId;
    if (!userId) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(ApiResponse.error('UNAUTHORIZED', 'User not authenticated'));
    }
    if (!targetUserId) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponse.error('INVALID_REQUEST', 'targetUserId is required'));
    }
    await this._safetyRepository.unblockUser(userId, targetUserId);
    return res
      .status(HttpStatus.OK)
      .json(ApiResponse.success('User unblocked successfully'));
  };

  getBlockedUsers = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?.userId;
    if (!userId) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(ApiResponse.error('UNAUTHORIZED', 'User not authenticated'));
    }
    const blockedUsers = await this._safetyRepository.getBlockedUsers(userId);
    return res
      .status(HttpStatus.OK)
      .json(
        ApiResponse.success(
          'Blocked users retrieved successfully',
          blockedUsers,
        ),
      );
  };

  reportUser = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?.userId;
    const { targetUserId, reason, details, category } = req.body;
    if (!userId) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(ApiResponse.error('UNAUTHORIZED', 'User not authenticated'));
    }
    if (!targetUserId || !reason) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(
          ApiResponse.error(
            'INVALID_REQUEST',
            'targetUserId and reason are required',
          ),
        );
    }
    const report = await this._safetyRepository.createReport({
      reporterId: userId,
      reportedUserId: targetUserId,
      category,
      reason,
      details,
    });
    return res
      .status(HttpStatus.CREATED)
      .json(
        ApiResponse.success(
          'Report submitted successfully. Our safety team will review it.',
          report,
        ),
      );
  };
}
