import { Router } from 'express';
import literatureController from '../controllers/literature.controller';
import { asyncHandler } from '../middleware/error.handler';

const router = Router();

// 文献管理路由
router.get('/', asyncHandler(literatureController.getLiteratures.bind(literatureController)));
router.get('/:id', asyncHandler(literatureController.getLiteratureById.bind(literatureController)));
router.post('/', asyncHandler(literatureController.createLiterature.bind(literatureController)));
router.put('/:id', asyncHandler(literatureController.updateLiterature.bind(literatureController)));
router.delete('/:id', asyncHandler(literatureController.deleteLiterature.bind(literatureController)));

// 统计路由
router.post('/:id/view', asyncHandler(literatureController.incrementViewCount.bind(literatureController)));
router.post('/:id/download', asyncHandler(literatureController.incrementDownloadCount.bind(literatureController)));

// 文件访问路由
router.get('/:id/read-url', asyncHandler(literatureController.getReadUrl.bind(literatureController)));
router.get('/:id/download-url', asyncHandler(literatureController.getDownloadUrl.bind(literatureController)));

export default router;
