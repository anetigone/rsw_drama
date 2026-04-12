import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { errorResponse } from '../utils/response';

export function validateQuery(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(
          errorResponse('VALIDATION_ERROR', '查询参数验证失败', error.errors)
        );
      }
      next(error);
    }
  };
}

export function validateBody(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(
          errorResponse('VALIDATION_ERROR', '请求体验证失败', error.errors)
        );
      }
      next(error);
    }
  };
}

export function validateParams(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(
          errorResponse('VALIDATION_ERROR', '路径参数验证失败', error.errors)
        );
      }
      next(error);
    }
  };
}
