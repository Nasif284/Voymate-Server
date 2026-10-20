import { inject, injectable } from 'tsyringe';
import { NextFunction, Request, Response } from 'express';

import { TOKENS } from '../../../../infrastructure/di/tokens';
import { HttpStatus } from '../../../../domain/enums/HttpStatusCodes.constants';
import { UnauthorizedError } from '../../../../domain/errors/auth.error';

import { ITokenService } from '../../../../application/interfaces/services/token.service.interface';
import { ISaveAdminActivity } from '../../../../application/interfaces/use-cases/admins/admin-activity.interface';

import {
  AdminRoleType,
  normalizeAdminRole,
} from '../../../../domain/enums/admin-role.enum';

@injectable()
export class AdminAuthMiddleware {
  constructor(
    @inject(TOKENS.ITokenService)
    private readonly tokenService: ITokenService,

    @inject(TOKENS.ISaveAdminActivity)
    private readonly saveAdminActivity: ISaveAdminActivity,
  ) {}

  authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const token = req.cookies?.adminAccessToken;
      if (!token) {
        throw new UnauthorizedError();
      }

      const payload = this.tokenService.verifyAccessToken(token);
      req.user = {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      };

      const ip =
        req.headers['x-forwarded-for']?.toString().split(',')[0] ||
        req.socket.remoteAddress ||
        '';

      await this.saveAdminActivity.execute({
        adminId: payload.userId,
        ip: ip.startsWith('::ffff:') ? ip.slice(7) : ip,
      });

      next();
    } catch (err) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: err instanceof Error ? err.message : 'Unauthorized.',
        },
      });
    }
  };

  authorize = (...allowedRoles: (AdminRoleType | string)[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      const userRole = req.user?.role;
      if (!userRole) {
        res.status(HttpStatus.FORBIDDEN).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Access denied: No role assigned.',
          },
        });
        return;
      }

      const normalizedUserRole = normalizeAdminRole(userRole);
      const isAllowed = allowedRoles.some((allowed) => {
        const normalizedAllowed = normalizeAdminRole(allowed);
        return normalizedAllowed && normalizedAllowed === normalizedUserRole;
      });

      if (!isAllowed) {
        res.status(HttpStatus.FORBIDDEN).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Access denied: Insufficient privileges.',
          },
        });
        return;
      }

      next();
    };
  };
}
