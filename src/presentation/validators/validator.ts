import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export function validate(
  schema: ZodSchema,
  source: 'body' | 'query' | 'params' = 'body',
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const dataToValidate =
      source === 'query'
        ? req.query
        : source === 'params'
          ? req.params
          : req.body;
    const result = schema.safeParse(dataToValidate);

    if (!result.success) {
      const errors = (result.error as ZodError).issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));

      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: errors[0]?.message ?? 'Validation failed.',
          errors,
        },
      });
      return;
    }

    if (source === 'body' && req.body && typeof req.body === 'object') {
      Object.assign(req.body, result.data);
    }

    next();
  };
}
