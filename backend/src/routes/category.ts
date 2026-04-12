import { Router } from 'express';
import categoryController from '../controllers/category.controller';
import { asyncHandler } from '../middleware/error.handler';

const router = Router();

// 分类路由
router.get('/', asyncHandler(categoryController.getCategories.bind(categoryController)));

export default router;
