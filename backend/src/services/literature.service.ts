import prisma from '../config/database';
import { AppError } from '../middleware/error.handler';
import { LiteratureQuery, LiteratureCreateInput, LiteratureUpdateInput } from '../types';
import logger from '../utils/logger';

export class LiteratureService {
  /**
   * 获取文献列表(分页)
   */
  async getLiteratures(query: LiteratureQuery) {
    const {
      page = 1,
      pageSize = 10,
      category,
      author,
      keyword,
      sortBy = 'uploadDate',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * pageSize;

    // 构建查询条件
    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (author) {
      where.author = { contains: author };
    }

    if (keyword) {
      where.OR = [
        { title: { contains: keyword } },
        { description: { contains: keyword } },
      ];
    }

    // 构建排序条件
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // 查询文献列表和总数
    const [items, total] = await Promise.all([
      prisma.literature.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
        select: {
          id: true,
          title: true,
          author: true,
          year: true,
          description: true,
          category: true,
          totalPages: true,
          uploadDate: true,
          viewCount: true,
          downloadCount: true,
        },
      }),
      prisma.literature.count({ where }),
    ]);

    logger.debug(`Retrieved ${items.length} literatures (total: ${total})`);

    return { items, total, page, pageSize };
  }

  /**
   * 获取文献详情
   */
  async getLiteratureById(id: string) {
    const literature = await prisma.literature.findUnique({
      where: { id },
    });

    if (!literature) {
      throw new AppError(404, 'NOT_FOUND', '文献不存在');
    }

    logger.debug(`Retrieved literature: ${id}`);

    return literature;
  }

  /**
   * 创建文献
   */
  async createLiterature(input: LiteratureCreateInput) {
    const literature = await prisma.literature.create({
      data: input,
    });

    logger.info(`Created literature: ${literature.id}`);

    return literature;
  }

  /**
   * 更新文献
   */
  async updateLiterature(id: string, input: LiteratureUpdateInput) {
    // 检查文献是否存在
    const existing = await prisma.literature.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError(404, 'NOT_FOUND', '文献不存在');
    }

    const literature = await prisma.literature.update({
      where: { id },
      data: input,
    });

    logger.info(`Updated literature: ${id}`);

    return literature;
  }

  /**
   * 删除文献
   */
  async deleteLiterature(id: string) {
    // 检查文献是否存在
    const existing = await prisma.literature.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError(404, 'NOT_FOUND', '文献不存在');
    }

    await prisma.literature.delete({
      where: { id },
    });

    logger.info(`Deleted literature: ${id}`);

    return existing; // 返回删除的文献信息(包含 ossKey)
  }

  /**
   * 增加浏览次数
   */
  async incrementViewCount(id: string) {
    const literature = await prisma.literature.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });

    logger.debug(`Incremented view count for literature: ${id}`);

    return { viewCount: literature.viewCount };
  }

  /**
   * 增加下载次数
   */
  async incrementDownloadCount(id: string) {
    const literature = await prisma.literature.update({
      where: { id },
      data: {
        downloadCount: {
          increment: 1,
        },
      },
    });

    logger.debug(`Incremented download count for literature: ${id}`);

    return { downloadCount: literature.downloadCount };
  }

  /**
   * 获取分类列表
   */
  async getCategories() {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { literatures: true },
        },
      },
    });

    return categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      sortOrder: cat.sortOrder,
      literatureCount: cat._count.literatures,
    }));
  }

  /**
   * 获取统计数据
   */
  async getStatistics() {
    const [totalLiteratures, totalViews, totalDownloads, categories] =
      await Promise.all([
        prisma.literature.count(),
        prisma.literature.aggregate({
          _sum: { viewCount: true },
        }),
        prisma.literature.aggregate({
          _sum: { downloadCount: true },
        }),
        prisma.literature.groupBy({
          by: ['category'],
          _count: true,
        }),
      ]);

    return {
      totalLiteratures,
      totalViews: totalViews._sum.viewCount || 0,
      totalDownloads: totalDownloads._sum.downloadCount || 0,
      categories: categories.map(c => ({
        name: c.category,
        count: c._count,
      })),
    };
  }
}

export default new LiteratureService();
