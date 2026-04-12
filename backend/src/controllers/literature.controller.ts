import { Request, Response } from 'express';
import { z } from 'zod';
import literatureService from '../services/literature.service';
import ossService from '../services/oss.service';
import { AppError } from '../middleware/error.handler';
import { successResponse, paginatedResponse } from '../utils/response';
import logger from '../utils/logger';

// 验证 schemas
const literatureQuerySchema = z.object({
  page: z.string().optional().transform(s => s ? parseInt(s) : undefined),
  pageSize: z.string().optional().transform(s => s ? parseInt(s) : undefined),
  category: z.string().optional(),
  author: z.string().optional(),
  keyword: z.string().optional(),
  sortBy: z.enum(['uploadDate', 'viewCount', 'title', 'year']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

const literatureCreateSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  year: z.number().int().min(1900).max(new Date().getFullYear()),
  description: z.string().optional(),
  category: z.string().min(1),
  ossKey: z.string().min(1),
  fileName: z.string().min(1),
  fileSize: z.number().int().positive(),
  mimeType: z.string().min(1),
  totalPages: z.number().int().positive().optional(),
});

const literatureUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  author: z.string().min(1).optional(),
  year: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
  description: z.string().optional(),
  category: z.string().min(1).optional(),
  totalPages: z.number().int().positive().optional(),
});

const paramsSchema = z.object({
  id: z.string().uuid(),
});

export class LiteratureController {
  /**
   * 获取文献列表
   */
  async getLiteratures(req: Request, res: Response) {
    const query = literatureQuerySchema.parse(req.query);
    const result = await literatureService.getLiteratures(query);

    return res.json(
      paginatedResponse(result.items, result.page, result.pageSize, result.total)
    );
  }

  /**
   * 获取文献详情
   */
  async getLiteratureById(req: Request, res: Response) {
    const { id } = paramsSchema.parse(req.params);
    const literature = await literatureService.getLiteratureById(id);

    return res.json(successResponse(literature));
  }

  /**
   * 创建文献
   */
  async createLiterature(req: Request, res: Response) {
    const input = literatureCreateSchema.parse(req.body);
    const literature = await literatureService.createLiterature(input);

    return res.status(201).json(
      successResponse(literature, '文献创建成功')
    );
  }

  /**
   * 更新文献
   */
  async updateLiterature(req: Request, res: Response) {
    const { id } = paramsSchema.parse(req.params);
    const input = literatureUpdateSchema.parse(req.body);
    const literature = await literatureService.updateLiterature(id, input);

    return res.json(successResponse(literature, '文献更新成功'));
  }

  /**
   * 删除文献
   */
  async deleteLiterature(req: Request, res: Response) {
    const { id } = paramsSchema.parse(req.params);
    const literature = await literatureService.deleteLiterature(id);

    // 删除 OSS 文件
    try {
      await ossService.deleteFile(literature.ossKey);
    } catch (error) {
      logger.error(`Failed to delete OSS file: ${literature.ossKey}`, error);
      // 即使删除 OSS 文件失败,也继续(数据库已删除)
    }

    return res.json(successResponse(null, '文献删除成功'));
  }

  /**
   * 增加浏览次数
   */
  async incrementViewCount(req: Request, res: Response) {
    const { id } = paramsSchema.parse(req.params);
    const result = await literatureService.incrementViewCount(id);

    return res.json(successResponse(result));
  }

  /**
   * 增加下载次数
   */
  async incrementDownloadCount(req: Request, res: Response) {
    const { id } = paramsSchema.parse(req.params);
    const result = await literatureService.incrementDownloadCount(id);

    return res.json(successResponse(result));
  }

  /**
   * 获取预签名阅读 URL
   */
  async getReadUrl(req: Request, res: Response) {
    const { id } = paramsSchema.parse(req.params);
    const literature = await literatureService.getLiteratureById(id);

    const readUrl = await ossService.generatePresignedReadUrl(literature.ossKey);

    return res.json(
      successResponse({
        readUrl,
        expiresIn: 3600,
      })
    );
  }

  /**
   * 获取下载 URL
   */
  async getDownloadUrl(req: Request, res: Response) {
    const { id } = paramsSchema.parse(req.params);
    const literature = await literatureService.getLiteratureById(id);

    // 增加下载计数
    await literatureService.incrementDownloadCount(id);

    const downloadUrl = await ossService.generatePresignedReadUrl(literature.ossKey);

    return res.json(
      successResponse({
        downloadUrl,
        fileName: literature.fileName,
        expiresIn: 3600,
      })
    );
  }
}

export default new LiteratureController();
