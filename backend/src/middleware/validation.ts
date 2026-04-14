import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { errorResponse } from '../utils/response';

export function validateQuery<T = any>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query) as any;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(
          errorResponse('VALIDATION_ERROR', '查询参数验证失败', error.issues)
        );
      }
      next(error);
    }
  };
}

export function validateBody<T = any>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body) as any;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(
          errorResponse('VALIDATION_ERROR', '请求体验证失败', error.issues)
        );
      }
      next(error);
    }
  };
}

export function validateParams<T = any>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.params = schema.parse(req.params) as any;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(
          errorResponse('VALIDATION_ERROR', '路径参数验证失败', error.issues)
        );
      }
      next(error);
    }
  };
}
