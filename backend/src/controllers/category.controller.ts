import { Request, Response } from 'express';
import { z } from 'zod';
import categoryService from '../services/category.service';
import { successResponse } from '../utils/response';

// 验证 schemas
const categoryCreateSchema = z.object({
  name: z.string().min(1, '分类名称不能为空'),
  description: z.string().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

const categoryUpdateSchema = z.object({
  name: z.string().min(1, '分类名称不能为空').optional(),
  description: z.string().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

const paramsSchema = z.object({
  id: z.uuid(),
});

export class CategoryController {
  /**
   * 获取所有分类
   */
  async getCategories(req: Request, res: Response) {
    const categories = await categoryService.getCategories();

    return res.json(successResponse(categories));
  }

  /**
   * 获取分类详情
   */
  async getCategoryById(req: Request, res: Response) {
    const { id } = paramsSchema.parse(req.params);
    const category = await categoryService.getCategoryById(id);

    return res.json(successResponse(category));
  }

  /**
   * 创建分类
   */
  async createCategory(req: Request, res: Response) {
    const input = categoryCreateSchema.parse(req.body);
    const category = await categoryService.createCategory(input);

    return res.status(201).json(
      successResponse(category, '分类创建成功')
    );
  }

  /**
   * 更新分类
   */
  async updateCategory(req: Request, res: Response) {
    const { id } = paramsSchema.parse(req.params);
    const input = categoryUpdateSchema.parse(req.body);
    const category = await categoryService.updateCategory(id, input);

    return res.json(successResponse(category, '分类更新成功'));
  }

  /**
   * 删除分类
   */
  async deleteCategory(req: Request, res: Response) {
    const { id } = paramsSchema.parse(req.params);
    const result = await categoryService.deleteCategory(id);

    return res.json(successResponse(result, '分类删除成功'));
  }
}

export default new CategoryController();
