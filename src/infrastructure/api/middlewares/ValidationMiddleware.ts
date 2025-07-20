import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';

import { ValidationError } from '../../../shared/errors/AppError';

export const validateRequest = (schema: {
  body?: ZodSchema<any>;
  params?: ZodSchema<any>;
  query?: ZodSchema<any>;
}) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }

      if (schema.params) {
        req.params = await schema.params.parseAsync(req.params) as any;
      }

      if (schema.query) {
        req.query = await schema.query.parseAsync(req.query) as any;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((issue) => {
          const path = issue.path.join('.');
          return `${path}: ${issue.message}`;
        }).join(', ');

        next(new ValidationError(`Validation failed: ${errorMessages}`));
      } else {
        next(error);
      }
    }
  };
};
