import { Router } from 'express';
import literatureController from '../controllers/literature.controller';
import { asyncHandler } from '../middleware/error.handler';
import { authenticate } from '../middleware/auth';

const router = Router();

// 公开路由
router.get('/', asyncHandler(literatureController.getLiteratures.bind(literatureController)));
router.get('/:id', asyncHandler(literatureController.getLiteratureById.bind(literatureController)));
router.post('/:id/view', asyncHandler(literatureController.incrementViewCount.bind(literatureController)));
router.post('/:id/download', asyncHandler(literatureController.incrementDownloadCount.bind(literatureController)));
router.get('/:id/read-url', asyncHandler(literatureController.getReadUrl.bind(literatureController)));
router.get('/:id/download-url', asyncHandler(literatureController.getDownloadUrl.bind(literatureController)));

// 需要认证的路由
router.post('/', authenticate, asyncHandler(literatureController.createLiterature.bind(literatureController)));
router.put('/:id', authenticate, asyncHandler(literatureController.updateLiterature.bind(literatureController)));
router.delete('/:id', authenticate, asyncHandler(literatureController.deleteLiterature.bind(literatureController)));

export default router;
