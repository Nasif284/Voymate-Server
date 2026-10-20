import { inject, injectable } from 'tsyringe';
import { NextFunction, Request, Response } from 'express';
import { TOKENS } from '../../../../infrastructure/di/tokens';
import { HttpStatus } from '../../../../domain/enums/HttpStatusCodes.constants';
import { UnauthorizedError } from '../../../../domain/errors/auth.error';
import { ITokenService } from '../../../../application/interfaces/services/token.service.interface';

@injectable()
export class CommunityAuthMiddleware {
  constructor(
    @inject(TOKENS.ITokenService)
    private readonly tokenService: ITokenService,
  ) {}

  authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      const bearerToken = authHeader?.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : null;

      const token =
        req.cookies?.communityAccessToken ||
        bearerToken ||
        req.cookies?.accessToken;

      if (!token) {
        throw new UnauthorizedError();
      }

      const payload = this.tokenService.verifyAccessToken(token);

      req.user = {
        userId: payload.userId,
        email: payload.email,
        role: payload.role || 'COMMUNITY',
      };

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
}
