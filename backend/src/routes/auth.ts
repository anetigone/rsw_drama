import { Router } from 'express';
import authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/error.handler';

const router = Router();

// 登录路由 (无需认证)
router.post('/login', asyncHandler(authController.login.bind(authController)));

// 验证路由 (需要认证)
router.get('/verify', authenticate, asyncHandler(authController.verify.bind(authController)));

export default router;
