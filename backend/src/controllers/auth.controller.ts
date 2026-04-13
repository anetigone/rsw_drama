import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validateEnv } from '../config/env';

export const login = async (req: Request, res: Response) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        error: '请提供密码',
      });
    }

    const env = validateEnv();

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, env.ADMIN_PASSWORD);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: '密码错误',
      });
    }

    // 生成 JWT token
    const token = jwt.sign(
      { userId: 'admin' },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      data: {
        token,
        user: {
          id: 'admin',
          name: '管理员',
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: '登录失败',
    });
  }
};

export const verify = async (req: Request, res: Response) => {
  try {
    // 如果能到这里,说明已经通过认证中间件验证
    return res.json({
      success: true,
      data: {
        user: {
          id: 'admin',
          name: '管理员',
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '验证失败',
    });
  }
};

export default {
  login,
  verify,
};
