import { Router } from 'express';
import categoryController from '../controllers/category.controller';
import { asyncHandler } from '../middleware/error.handler';
import { authenticate } from '../middleware/auth';

const router = Router();

// 公开路由
router.get('/', asyncHandler(categoryController.getCategories.bind(categoryController)));
router.get('/:id', asyncHandler(categoryController.getCategoryById.bind(categoryController)));

// 需要认证的路由
router.post('/', authenticate, asyncHandler(categoryController.createCategory.bind(categoryController)));
router.put('/:id', authenticate, asyncHandler(categoryController.updateCategory.bind(categoryController)));
router.delete('/:id', authenticate, asyncHandler(categoryController.deleteCategory.bind(categoryController)));

export default router;
