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
        req.body = schema.body.parse(req.body);
      }

      if (schema.params) {
        req.params = schema.params.parse(req.params) as any;
      }

      if (schema.query) {
        req.query = schema.query.parse(req.query) as any;
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
