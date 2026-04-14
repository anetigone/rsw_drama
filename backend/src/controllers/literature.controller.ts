import { Request, Response } from 'express';
import { z } from 'zod';
import literatureService from '../services/literature.service';
import ossService from '../services/oss.service';
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
  imageUrl: z.string().optional(),
});

const literatureUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  author: z.string().min(1).optional(),
  year: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
  description: z.string().optional(),
  category: z.string().min(1).optional(),
  totalPages: z.number().int().positive().optional(),
  imageUrl: z.string().optional(),
});

const paramsSchema = z.object({
  id: z.uuid(),
});

// 分类缓存
let categoryCache: Map<string, string> | null = null;
let categoryCacheTime: number = 0;
const CATEGORY_CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存

/**
 * 获取分类映射（带缓存）
 */
async function getCategoryMap(): Promise<Map<string, string>> {
  const now = Date.now();

  // 如果缓存存在且未过期，直接返回
  if (categoryCache && (now - categoryCacheTime) < CATEGORY_CACHE_TTL) {
    return categoryCache;
  }

  // 否则重新加载分类
  const categories = await literatureService.getCategories();
  categoryCache = new Map(categories.map(cat => [cat.id, cat.name]));
  categoryCacheTime = now;

  return categoryCache;
}

/**
 * 为文献对象添加动态 URL
 */
async function enrichLiteratureWithURLs(literature: any, categoryMap?: Map<string, string>) {
  // 生成公共访问 URL (永久有效)
  const publicUrl = ossService.getPublicUrl(literature.ossKey);

  // 处理封面图片 URL - 加上 OSS 域名
  let coverUrl = literature.imageUrl;
  if (literature.imageUrl && !literature.imageUrl.startsWith('http')) {
    // 如果 imageUrl 只是 OSS key，需要加上完整域名
    coverUrl = ossService.getPublicUrl(literature.imageUrl);
  }

  const result = {
    ...literature,
    imageUrl: coverUrl, // 使用完整的公共 URL
    urls: {
      // 永久公共访问 URL
      public: publicUrl,
      // 预签名阅读 URL (1小时有效,用于私有文件或需要权限控制的场景)
      read: literature.ossKey ? null : null, // 按需生成
      // 下载 URL (需要调用专门的接口)
      download: `/api/literatures/${literature.id}/download`,
    },
  };

  // 如果提供了 categoryMap，添加 category 字段
  if (categoryMap) {
    (result as any).category = categoryMap.get(literature.categoryId) || '未分类';
  }

  return result;
}

/**
 * 批量为文献列表添加动态 URL
 */
async function enrichLiteraturesWithURLs(literatures: any[]) {
  // 获取分类映射（使用缓存）
  const categoryMap = await getCategoryMap();

  return Promise.all(
    literatures.map(async (lit) => {
      return await enrichLiteratureWithURLs(lit, categoryMap);
    })
  );
}

export class LiteratureController {
  /**
   * 获取文献列表
   */
  async getLiteratures(req: Request, res: Response) {
    const query = literatureQuerySchema.parse(req.query);
    const result = await literatureService.getLiteratures(query);

    // 为每个文献添加动态 URL
    const itemsWithURLs = await enrichLiteraturesWithURLs(result.items);

    return res.json(
      paginatedResponse(itemsWithURLs, result.page, result.pageSize, result.total)
    );
  }

  /**
   * 获取文献详情
   */
  async getLiteratureById(req: Request, res: Response) {
    const { id } = paramsSchema.parse(req.params);
    const literature = await literatureService.getLiteratureById(id);

    // 增加浏览计数
    await literatureService.incrementViewCount(id);

    // 获取分类映射（使用缓存）
    const categoryMap = await getCategoryMap();

    // 添加动态 URL 和分类
    const enriched = await enrichLiteratureWithURLs(literature, categoryMap);

    return res.json(successResponse(enriched));
  }

  /**
   * 创建文献
   */
  async createLiterature(req: Request, res: Response) {
    const input = literatureCreateSchema.parse(req.body);
    const literature = await literatureService.createLiterature(input);

    // 添加动态 URL
    const enriched = await enrichLiteratureWithURLs(literature);

    return res.status(201).json(
      successResponse(enriched, '文献创建成功')
    );
  }

  /**
   * 更新文献
   */
  async updateLiterature(req: Request, res: Response) {
    const { id } = paramsSchema.parse(req.params);
    const input = literatureUpdateSchema.parse(req.body);
    const literature = await literatureService.updateLiterature(id, input);

    // 添加动态 URL
    const enriched = await enrichLiteratureWithURLs(literature);

    return res.json(successResponse(enriched, '文献更新成功'));
  }

  /**
   * 删除文献
   */
  async deleteLiterature(req: Request, res: Response) {
    const { id } = paramsSchema.parse(req.params);
    const literature = await literatureService.deleteLiterature(id);

    // 删除 OSS 文件（PDF）
    try {
      await ossService.deleteFile(literature.ossKey);
    } catch (error) {
      logger.error(`Failed to delete OSS file: ${literature.ossKey}`, error);
      // 即使删除 OSS 文件失败,也继续(数据库已删除)
    }

    // 删除封面图片
    if (literature.imageUrl) {
      try {
        // 如果 imageUrl 是完整 URL，提取 OSS key
        let coverOssKey = literature.imageUrl;
        if (literature.imageUrl.startsWith('http')) {
          // 从 URL 中提取 OSS key
          const url = new URL(literature.imageUrl);
          coverOssKey = url.pathname.slice(1); // 移除开头的 /
        }

        await ossService.deleteFile(coverOssKey);
        logger.info(`Deleted cover image: ${coverOssKey}`);
      } catch (error) {
        logger.error(`Failed to delete cover image: ${literature.imageUrl}`, error);
        // 即使删除封面失败,也继续(数据库和 PDF 已删除)
      }
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
   * 获取预签名阅读 URL (用于在线预览)
   * 路由: GET /api/literatures/:id/read-url
   */
  async getReadUrl(req: Request, res: Response) {
    const { id } = paramsSchema.parse(req.params);
    const literature = await literatureService.getLiteratureById(id);

    // 生成预签名 URL (1小时有效)
    // 用于前端阅读器，过期后需要重新获取
    const readUrl = await ossService.generatePresignedReadUrl(literature.ossKey, 3600);

    logger.info(`Generated read URL for literature ${id}`, {
      ossKey: literature.ossKey,
      expiresIn: 3600
    });

    return res.json(
      successResponse({
        readUrl,
        expiresIn: 3600,
        fileName: literature.fileName,
      })
    );
  }

  /**
   * 获取下载 URL (增加下载计数)
   * 路由: GET /api/literatures/:id/download-url
   */
  async getDownloadUrl(req: Request, res: Response) {
    const { id } = paramsSchema.parse(req.params);
    const literature = await literatureService.getLiteratureById(id);

    // 增加下载计数
    await literatureService.incrementDownloadCount(id);

    // 生成预签名下载 URL (1小时有效)
    const downloadUrl = await ossService.generatePresignedReadUrl(literature.ossKey, 3600);

    logger.info(`Generated download URL for literature ${id}`, {
      ossKey: literature.ossKey,
      expiresIn: 3600
    });

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
