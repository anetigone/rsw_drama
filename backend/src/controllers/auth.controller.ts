import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validateEnv } from '../config/env';

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: '请提供用户名和密码',
      });
    }

    const env = validateEnv();

    // 查找匹配的管理员用户
    const adminUser = env.ADMIN_USERS.find(
      (user: any) => user.username === username
    );

    if (!adminUser) {
      return res.status(401).json({
        success: false,
        error: '用户名或密码错误',
      });
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, adminUser.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: '用户名或密码错误',
      });
    }

    // 生成 JWT token
    const token = jwt.sign(
      { userId: adminUser.username, username: adminUser.username },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      data: {
        token,
        user: {
          id: adminUser.username,
          username: adminUser.username,
          name: adminUser.name || adminUser.username,
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
    const env = validateEnv();

    // 从 JWT 中获取用户信息
    const authUser = (req as any).user;

    if (!authUser || !authUser.username) {
      return res.status(401).json({
        success: false,
        error: '未授权',
      });
    }

    // 查找完整用户信息
    const adminUser = env.ADMIN_USERS.find(
      (user: any) => user.username === authUser.username
    );

    if (!adminUser) {
      return res.status(401).json({
        success: false,
        error: '用户不存在',
      });
    }

    return res.json({
      success: true,
      data: {
        user: {
          id: adminUser.username,
          username: adminUser.username,
          name: adminUser.name || adminUser.username,
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
