import { prisma } from '../config/database';
import { AppError } from '../middleware/error.handler';
import logger from '../utils/logger';

export class CategoryService {
  /**
   * 获取所有分类
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
   * 获取分类详情
   */
  async getCategoryById(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { literatures: true },
        },
      },
    });

    if (!category) {
      throw new AppError(404, 'NOT_FOUND', '分类不存在');
    }

    return {
      id: category.id,
      name: category.name,
      description: category.description,
      sortOrder: category.sortOrder,
      literatureCount: category._count.literatures,
      createdAt: category.createdAt,
    };
  }

  /**
   * 创建分类
   */
  async createCategory(input: {
    name: string;
    description?: string;
    sortOrder?: number;
  }) {
    // 检查分类名是否已存在
    const existing = await prisma.category.findUnique({
      where: { name: input.name },
    });

    if (existing) {
      throw new AppError(409, 'DUPLICATE_NAME', '分类名称已存在');
    }

    const category = await prisma.category.create({
      data: {
        name: input.name,
        description: input.description,
        sortOrder: input.sortOrder ?? 0,
      },
    });

    logger.info(`Created category: ${category.id} (${category.name})`);

    return {
      id: category.id,
      name: category.name,
      description: category.description,
      sortOrder: category.sortOrder,
      literatureCount: 0,
      createdAt: category.createdAt,
    };
  }

  /**
   * 更新分类
   */
  async updateCategory(
    id: string,
    input: {
      name?: string;
      description?: string;
      sortOrder?: number;
    }
  ) {
    // 检查分类是否存在
    const existing = await prisma.category.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError(404, 'NOT_FOUND', '分类不存在');
    }

    // 如果要更新名称，检查新名称是否已被使用
    if (input.name && input.name !== existing.name) {
      const duplicate = await prisma.category.findUnique({
        where: { name: input.name },
      });

      if (duplicate) {
        throw new AppError(409, 'DUPLICATE_NAME', '分类名称已存在');
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: input.name,
        description: input.description,
        sortOrder: input.sortOrder,
      },
      include: {
        _count: {
          select: { literatures: true },
        },
      },
    });

    logger.info(`Updated category: ${id} (${category.name})`);

    return {
      id: category.id,
      name: category.name,
      description: category.description,
      sortOrder: category.sortOrder,
      literatureCount: category._count.literatures,
      createdAt: category.createdAt,
    };
  }

  /**
   * 删除分类
   */
  async deleteCategory(id: string) {
    // 检查分类是否存在
    const existing = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { literatures: true },
        },
      },
    });

    if (!existing) {
      throw new AppError(404, 'NOT_FOUND', '分类不存在');
    }

    // 检查是否有关联的文献
    if (existing._count.literatures > 0) {
      throw new AppError(
        409,
        'CATEGORY_IN_USE',
        `该分类下还有 ${existing._count.literatures} 篇文献，无法删除`
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    logger.info(`Deleted category: ${id} (${existing.name})`);

    return { message: '分类删除成功' };
  }
}

export default new CategoryService();
