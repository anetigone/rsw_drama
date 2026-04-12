import { Router } from 'express';
import statisticsController from '../controllers/statistics.controller';
import { asyncHandler } from '../middleware/error.handler';

const router = Router();

// 统计路由
router.get('/', asyncHandler(statisticsController.getStatistics.bind(statisticsController)));

export default router;
