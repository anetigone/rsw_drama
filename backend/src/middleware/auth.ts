import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { validateEnv } from '../config/env';

export interface AuthRequest extends Request {
  userId?: string;
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: '未提供认证令牌',
      });
    }

    const token = authHeader.substring(7);

    try {
      const env = validateEnv();
      const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string };
      req.userId = decoded.userId;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: '无效的认证令牌',
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '认证失败',
    });
  }
};
