import { Request, Response } from 'express';
import { injectable } from 'tsyringe';
import { RegisterDeviceTokenUseCase } from '../../../../application/use-cases/notifications/register-device-token.usecase';
import { UnregisterDeviceTokenUseCase } from '../../../../application/use-cases/notifications/unregister-device-token.usecase';
import { GetNotificationsUseCase } from '../../../../application/use-cases/notifications/get-notifications.usecase';
import { GetUnreadNotificationCountUseCase } from '../../../../application/use-cases/notifications/get-unread-count.usecase';
import { MarkNotificationReadUseCase } from '../../../../application/use-cases/notifications/mark-notification-read.usecase';
import { MarkAllNotificationsReadUseCase } from '../../../../application/use-cases/notifications/mark-all-read.usecase';
import { HttpStatus } from '../../../../domain/enums/HttpStatusCodes.constants';
import { ApiResponse } from '../../../responses/common-response';
import { DevicePlatform } from '../../../../domain/enums/notification.constants';

@injectable()
export class NotificationController {
  constructor(
    private readonly registerDeviceTokenUseCase: RegisterDeviceTokenUseCase,
    private readonly unregisterDeviceTokenUseCase: UnregisterDeviceTokenUseCase,
    private readonly getNotificationsUseCase: GetNotificationsUseCase,
    private readonly getUnreadCountUseCase: GetUnreadNotificationCountUseCase,
    private readonly markNotificationReadUseCase: MarkNotificationReadUseCase,
    private readonly markAllNotificationsReadUseCase: MarkAllNotificationsReadUseCase,
  ) {}

  registerDevice = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?.userId;
    const { token, platform, deviceId } = req.body;

    if (!token || !platform) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(
          ApiResponse.error('INVALID_INPUT', 'token and platform are required'),
        );
    }

    await this.registerDeviceTokenUseCase.execute(userId!, {
      token,
      platform: platform as DevicePlatform,
      deviceId,
    });

    return res
      .status(HttpStatus.OK)
      .json(ApiResponse.success('Device registered successfully'));
  };

  unregisterDevice = async (req: Request, res: Response): Promise<Response> => {
    const { token } = req.body;

    if (!token) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponse.error('INVALID_INPUT', 'token is required'));
    }

    await this.unregisterDeviceTokenUseCase.execute({ token });

    return res
      .status(HttpStatus.OK)
      .json(ApiResponse.success('Device unregistered successfully'));
  };

  getNotifications = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?.userId;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : 20;
    const unreadOnly = req.query.unreadOnly === 'true';

    const result = await this.getNotificationsUseCase.execute(userId!, {
      page,
      limit,
      unreadOnly,
    });

    return res
      .status(HttpStatus.OK)
      .json(ApiResponse.success('Notifications fetched successfully', result));
  };

  getUnreadCount = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?.userId;
    const count = await this.getUnreadCountUseCase.execute(userId!);

    return res
      .status(HttpStatus.OK)
      .json(
        ApiResponse.success('Unread count fetched', { unreadCount: count }),
      );
  };

  markAsRead = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?.userId;
    const id = req.params.id as string;

    await this.markNotificationReadUseCase.execute(userId!, id);

    return res
      .status(HttpStatus.OK)
      .json(ApiResponse.success('Notification marked as read'));
  };

  markAllAsRead = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?.userId;
    const updatedCount = await this.markAllNotificationsReadUseCase.execute(
      userId!,
    );

    return res.status(HttpStatus.OK).json(
      ApiResponse.success('All notifications marked as read', {
        updatedCount,
      }),
    );
  };
}
