import { Router } from 'express';
import uploadController from '../controllers/upload.controller';
import { asyncHandler } from '../middleware/error.handler';

const router = Router();

// 上传相关路由
router.post(
  '/presigned-url',
  asyncHandler(uploadController.getPresignedUrl.bind(uploadController))
);

router.post(
  '/confirm',
  asyncHandler(uploadController.confirmUpload.bind(uploadController))
);

export default router;
