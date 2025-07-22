import { Request, Response, NextFunction } from 'express';

import { AppError } from '../../../shared/errors/AppError';
import { logger } from '../../../shared/utils/Logger';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    logger.error(`AppError: ${err.message}`, err);
    res.status(err.statusCode).json({
      error: {
        message: err.message,
        statusCode: err.statusCode,
      },
    });
    return;
  }

  logger.error('Unexpected error', err);
  res.status(500).json({
    error: {
      message: 'Internal server error',
      statusCode: 500,
    },
  });
};
