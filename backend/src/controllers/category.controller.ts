import { Request, Response } from 'express';
import literatureService from '../services/literature.service';
import { successResponse } from '../utils/response';

export class CategoryController {
  /**
   * 获取所有分类
   */
  async getCategories(req: Request, res: Response) {
    const categories = await literatureService.getCategories();

    return res.json(successResponse(categories));
  }
}

export default new CategoryController();
