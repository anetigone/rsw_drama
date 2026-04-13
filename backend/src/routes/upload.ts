import { Router } from 'express';
import uploadController from '../controllers/upload.controller';
import { asyncHandler } from '../middleware/error.handler';
import { authenticate } from '../middleware/auth';

const router = Router();

// 上传相关路由 (需要认证)
router.post(
  '/presigned-url',
  authenticate,
  asyncHandler(uploadController.getPresignedUrl.bind(uploadController))
);

router.post(
  '/confirm',
  authenticate,
  asyncHandler(uploadController.confirmUpload.bind(uploadController))
);

export default router;
