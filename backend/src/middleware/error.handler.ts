import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import logger from '../utils/logger';
import { errorResponse } from '../utils/response';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error('Error occurred:', err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json(
      errorResponse(err.code, err.message, err.details)
    );
  }

  if (err instanceof ZodError) {
    return res.status(400).json(
      errorResponse(
        'VALIDATION_ERROR',
        '请求参数验证失败',
        err.errors
      )
    );
  }

  // 默认错误响应
  res.status(500).json(
    errorResponse(
      'INTERNAL_SERVER_ERROR',
      process.env.NODE_ENV === 'development' ? err.message : '服务器内部错误'
    )
  );
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
