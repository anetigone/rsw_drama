import { Request, Response } from 'express';
import literatureService from '../services/literature.service';
import { successResponse } from '../utils/response';

export class StatisticsController {
  /**
   * 获取统计数据
   */
  async getStatistics(req: Request, res: Response) {
    const statistics = await literatureService.getStatistics();

    return res.json(successResponse(statistics));
  }
}

export default new StatisticsController();
