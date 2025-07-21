import type { Request, Response, NextFunction } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';
import type { ParsedQs } from 'qs';
import type { ZodSchema } from 'zod';
import { ZodError } from 'zod';

import { ValidationError } from '../../../shared/errors/AppError';

export const validateRequest = (schema: {
  body?: ZodSchema<unknown>;
  params?: ZodSchema<ParamsDictionary>;
  query?: ZodSchema<ParsedQs>;
}) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }

      if (schema.params) {
        req.params = schema.params.parse(req.params);
      }

      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues
          .map((issue) => {
            const path = issue.path.join('.');
            return `${path}: ${issue.message}`;
          })
          .join(', ');

        next(new ValidationError(`Validation failed: ${errorMessages}`));
      } else {
        next(error);
      }
    }
  };
};
