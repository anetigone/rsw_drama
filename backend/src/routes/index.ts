import { Router } from 'express';
import literatureRoutes from './literature';
import uploadRoutes from './upload';
import statisticsRoutes from './statistics';
import categoryRoutes from './category';

const router = Router();

// API 路由
router.use('/literatures', literatureRoutes);
router.use('/upload', uploadRoutes);
router.use('/statistics', statisticsRoutes);
router.use('/categories', categoryRoutes);

export default router;
