import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { prisma } from '../prisma';

describe('Prisma CRUD Tests', () => {
  // 清理测试数据
  async function cleanupTestData() {
    await prisma.literature.deleteMany({
      where: {
        title: {
          contains: '[TEST]'
        }
      }
    });
    await prisma.category.deleteMany({
      where: {
        name: {
          contains: '[TEST]'
        }
      }
    });
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: '[TEST]'
        }
      }
    });
  }

  beforeEach(async () => {
    await cleanupTestData();
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  describe('Category CRUD', () => {
    it('should create a new category', async () => {
      const category = await prisma.category.create({
        data: {
          name: '[TEST] 戏曲理论',
          description: '测试分类描述',
          sortOrder: 1
        }
      });

      expect(category).toBeDefined();
      expect(category.id).toBeDefined();
      expect(category.name).toBe('[TEST] 戏曲理论');
      expect(category.description).toBe('测试分类描述');
      expect(category.sortOrder).toBe(1);
    });

    it('should read a category by id', async () => {
      const created = await prisma.category.create({
        data: {
          name: '[TEST] 昆曲',
          description: '昆曲相关文献'
        }
      });

      const found = await prisma.category.findUnique({
        where: { id: created.id }
      });

      expect(found).not.toBeNull();
      expect(found?.name).toBe('[TEST] 昆曲');
    });

    it('should update a category', async () => {
      const category = await prisma.category.create({
        data: {
          name: '[TEST] 原名称',
          description: '原始描述'
        }
      });

      const updated = await prisma.category.update({
        where: { id: category.id },
        data: {
          name: '[TEST] 更新后的名称',
          description: '更新后的描述',
          sortOrder: 10
        }
      });

      expect(updated.name).toBe('[TEST] 更新后的名称');
      expect(updated.description).toBe('更新后的描述');
      expect(updated.sortOrder).toBe(10);
    });

    it('should delete a category', async () => {
      const category = await prisma.category.create({
        data: {
          name: '[TEST] 待删除'
        }
      });

      await prisma.category.delete({
        where: { id: category.id }
      });

      const found = await prisma.category.findUnique({
        where: { id: category.id }
      });

      expect(found).toBeNull();
    });

    it('should list all categories', async () => {
      await prisma.category.createMany({
        data: [
          { name: '[TEST] 分类1', sortOrder: 1 },
          { name: '[TEST] 分类2', sortOrder: 2 },
          { name: '[TEST] 分类3', sortOrder: 3 }
        ]
      });

      const categories = await prisma.category.findMany({
        where: {
          name: {
            contains: '[TEST]'
          }
        },
        orderBy: {
          sortOrder: 'asc'
        }
      });

      expect(categories).toHaveLength(3);
      expect(categories[0].sortOrder).toBeLessThanOrEqual(categories[1].sortOrder);
    });
  });

  describe('Literature CRUD', () => {
    let testCategoryId: string;

    beforeEach(async () => {
      const category = await prisma.category.create({
        data: {
          name: '[TEST] 测试分类',
          description: '用于文献测试的分类'
        }
      });
      testCategoryId = category.id;
    });

    it('should create a new literature', async () => {
      const literature = await prisma.literature.create({
        data: {
          title: '[TEST] 牡丹亭',
          author: '汤显祖',
          year: 1598,
          description: '昆曲代表作',
          category: '昆曲',
          ossKey: 'test/mudanting.pdf',
          fileName: 'mudanting.pdf',
          fileSize: 1024000,
          mimeType: 'application/pdf',
          totalPages: 200,
          categoryId: testCategoryId
        }
      });

      expect(literature).toBeDefined();
      expect(literature.id).toBeDefined();
      expect(literature.title).toBe('[TEST] 牡丹亭');
      expect(literature.ossKey).toBe('test/mudanting.pdf');
      expect(literature.viewCount).toBe(0);
      expect(literature.downloadCount).toBe(0);
    });

    it('should create literature without optional fields', async () => {
      const literature = await prisma.literature.create({
        data: {
          title: '[TEST] 简单文献',
          author: '测试作者',
          year: 2024,
          ossKey: 'test/simple.pdf',
          fileName: 'simple.pdf',
          fileSize: 1024,
          mimeType: 'application/pdf',
          categoryId: testCategoryId
        }
      });

      expect(literature.description).toBeNull();
      expect(literature.totalPages).toBeNull();
      expect(literature.categoryId).toBeNull();
    });

    it('should read literature with category relation', async () => {
      const literature = await prisma.literature.create({
        data: {
          title: '[TEST] 关联测试',
          author: '测试',
          year: 2024,
          category: '测试',
          ossKey: 'test/relation.pdf',
          fileName: 'relation.pdf',
          fileSize: 1024,
          mimeType: 'application/pdf',
          categoryId: testCategoryId
        }
      });

      const found = await prisma.literature.findUnique({
        where: { id: literature.id },
        include: {
          categoryRef: true
        }
      });

      expect(found).not.toBeNull();
      expect(found?.categoryRef).not.toBeNull();
      expect(found?.categoryRef.name).toBe('[TEST] 测试分类');
    });

    it('should update literature', async () => {
      const literature = await prisma.literature.create({
        data: {
          title: '[TEST] 原标题',
          author: '原作者',
          year: 2020,
          ossKey: 'test/original.pdf',
          fileName: 'original.pdf',
          fileSize: 1000,
          mimeType: 'application/pdf',
          categoryId: testCategoryId
        }
      });

      const updated = await prisma.literature.update({
        where: { id: literature.id },
        data: {
          title: '[TEST] 新标题',
          viewCount: 10,
          downloadCount: 5
        }
      });

      expect(updated.title).toBe('[TEST] 新标题');
      expect(updated.viewCount).toBe(10);
      expect(updated.downloadCount).toBe(5);
    });

    it('should increment counters', async () => {
      const literature = await prisma.literature.create({
        data: {
          title: '[TEST] 计数器测试',
          author: '测试',
          year: 2024,
          ossKey: 'test/counter.pdf',
          fileName: 'counter.pdf',
          fileSize: 1024,
          mimeType: 'application/pdf',
          categoryId: testCategoryId
        }
      });

      // 增加浏览次数
      const updated1 = await prisma.literature.update({
        where: { id: literature.id },
        data: {
          viewCount: {
            increment: 1
          }
        }
      });

      expect(updated1.viewCount).toBe(1);

      // 再增加下载次数
      const updated2 = await prisma.literature.update({
        where: { id: literature.id },
        data: {
          downloadCount: {
            increment: 1
          }
        }
      });

      expect(updated2.downloadCount).toBe(1);
      expect(updated2.viewCount).toBe(1); // 浏览次数应该保持
    });

    it('should delete literature', async () => {
      const literature = await prisma.literature.create({
        data: {
          title: '[TEST] 待删除',
          author: '测试',
          year: 2024,
          ossKey: 'test/delete.pdf',
          fileName: 'delete.pdf',
          fileSize: 1024,
          mimeType: 'application/pdf',
          categoryId: testCategoryId
        }
      });

      await prisma.literature.delete({
        where: { id: literature.id }
      });

      const found = await prisma.literature.findUnique({
        where: { id: literature.id }
      });

      expect(found).toBeNull();
    });

    it('should query literatures with filters', async () => {
      await prisma.literature.createMany({
        data: [
          {
            title: '[TEST] 昆曲1',
            author: '作者A',
            year: 2000,
            category: '昆曲',
            ossKey: 'test/k1.pdf',
            fileName: 'k1.pdf',
            fileSize: 1000,
            mimeType: 'application/pdf',
            categoryId: testCategoryId
          },
          {
            title: '[TEST] 京剧1',
            author: '作者B',
            year: 2001,
            category: '京剧',
            ossKey: 'test/j1.pdf',
            fileName: 'j1.pdf',
            fileSize: 1000,
            mimeType: 'application/pdf',
            categoryId: testCategoryId
          },
          {
            title: '[TEST] 昆曲2',
            author: '作者A',
            year: 2002,
            category: '昆曲',
            ossKey: 'test/k2.pdf',
            fileName: 'k2.pdf',
            fileSize: 1000,
            mimeType: 'application/pdf',
            categoryId: testCategoryId
          }
        ]
      });

      // 按分类筛选 (需要通过 categoryRef 关联查询)
      const kqResults = await prisma.literature.findMany({
        where: {
          categoryRef: {
            name: '昆曲'
          }
        }
      });
      expect(kqResults).toHaveLength(2);

      // 按作者筛选
      const authorResults = await prisma.literature.findMany({
        where: {
          author: '作者A'
        }
      });
      expect(authorResults).toHaveLength(2);

      // 组合筛选
      const combinedResults = await prisma.literature.findMany({
        where: {
          categoryRef: {
            name: '昆曲'
          },
          author: '作者A'
        }
      });
      expect(combinedResults).toHaveLength(2);
    });

    it('should paginate literatures', async () => {
      // 创建10条记录
      await prisma.literature.createMany({
        data: Array.from({ length: 10 }, (_, i) => ({
          title: `[TEST] 文献${i + 1}`,
          author: `作者${i + 1}`,
          year: 2000 + i,
          category: '测试',
          ossKey: `test/doc${i + 1}.pdf`,
          fileName: `doc${i + 1}.pdf`,
          fileSize: 1000,
          mimeType: 'application/pdf',
          categoryId: testCategoryId
        }))
      });

      // 第一页
      const page1 = await prisma.literature.findMany({
        where: {
          title: {
            contains: '[TEST]'
          }
        },
        take: 5,
        skip: 0,
        orderBy: {
          uploadDate: 'desc'
        }
      });
      expect(page1).toHaveLength(5);

      // 第二页
      const page2 = await prisma.literature.findMany({
        where: {
          title: {
            contains: '[TEST]'
          }
        },
        take: 5,
        skip: 5,
        orderBy: {
          uploadDate: 'desc'
        }
      });
      expect(page2).toHaveLength(5);

      // 确保没有重复
      const page1Ids = new Set(page1.map(l => l.id));
      const page2Ids = new Set(page2.map(l => l.id));
      const intersection = [...page1Ids].filter(x => page2Ids.has(x));
      expect(intersection).toHaveLength(0);
    });
  });

  describe('User CRUD', () => {
    it('should create a new user', async () => {
      const user = await prisma.user.create({
        data: {
          email: '[TEST] user1@example.com',
          password: 'hashedPassword123',
          role: 'user'
        }
      });

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.email).toBe('[TEST] user1@example.com');
      expect(user.role).toBe('user');
    });

    it('should find user by email', async () => {
      await prisma.user.create({
        data: {
          email: '[TEST] findme@example.com',
          password: 'hashedPassword123',
          role: 'user'
        }
      });

      const user = await prisma.user.findUnique({
        where: {
          email: '[TEST] findme@example.com'
        }
      });

      expect(user).not.toBeNull();
      expect(user?.email).toBe('[TEST] findme@example.com');
    });

    it('should enforce unique email constraint', async () => {
      await prisma.user.create({
        data: {
          email: '[TEST] duplicate@example.com',
          password: 'hashedPassword123',
          role: 'user'
        }
      });

      await expect(
        prisma.user.create({
          data: {
            email: '[TEST] duplicate@example.com',
            password: 'anotherPassword',
            role: 'user'
          }
        })
      ).rejects.toThrow();
    });

    it('should update user role', async () => {
      const user = await prisma.user.create({
        data: {
          email: '[TEST] admin@example.com',
          password: 'hashedPassword123',
          role: 'user'
        }
      });

      const updated = await prisma.user.update({
        where: { id: user.id },
        data: {
          role: 'admin'
        }
      });

      expect(updated.role).toBe('admin');
    });

    it('should update updatedAt timestamp', async () => {
      const user = await prisma.user.create({
        data: {
          email: '[TEST] timestamp@example.com',
          password: 'hashedPassword123',
          role: 'user'
        }
      });

      const originalUpdatedAt = user.updatedAt;

      // 等待一小段时间确保时间戳不同
      await new Promise(resolve => setTimeout(resolve, 10));

      const updated = await prisma.user.update({
        where: { id: user.id },
        data: {
          role: 'admin'
        }
      });

      expect(updated.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('Transaction Tests', () => {
    it('should create category and literature in a transaction', async () => {
      const result = await prisma.$transaction(async (tx) => {
        const category = await tx.category.create({
          data: {
            name: '[TEST] 事务测试分类',
            description: '在事务中创建'
          }
        });

        const literature = await tx.literature.create({
          data: {
            title: '[TEST] 事务测试文献',
            author: '测试作者',
            year: 2024,
            category: '测试',
            ossKey: 'test/tx.pdf',
            fileName: 'tx.pdf',
            fileSize: 1024,
            mimeType: 'application/pdf',
            categoryId: category.id
          }
        });

        return { category, literature };
      });

      expect(result.category.id).toBeDefined();
      expect(result.literature.categoryId).toBe(result.category.id);

      // 验证数据已保存
      const found = await prisma.literature.findUnique({
        where: { id: result.literature.id },
        include: { categoryRef: true }
      });

      expect(found?.categoryRef?.name).toBe('[TEST] 事务测试分类');
    });

    it('should rollback on error', async () => {
      let categoryId: string;

      try {
        await prisma.$transaction(async (tx) => {
          const category = await tx.category.create({
            data: {
              name: '[TEST] 回滚测试',
              description: '这个应该被回滚'
            }
          });

          categoryId = category.id;

          // 强制抛出错误
          throw new Error('Intentional error for rollback test');
        });
      } catch (error) {
        expect((error as Error).message).toBe('Intentional error for rollback test');
      }

      // 验证分类没有被创建
      const found = await prisma.category.findUnique({
        where: { id: categoryId! }
      });

      expect(found).toBeNull();
    });
  });

  describe('Aggregation Tests', () => {
    let testCategoryId: string;

    beforeEach(async () => {
      const category = await prisma.category.create({
        data: {
          name: '[TEST] 聚合测试分类',
          description: '用于聚合测试'
        }
      });
      testCategoryId = category.id;

      // 创建测试数据
      await prisma.literature.createMany({
        data: [
          {
            title: '[TEST] 文献1',
            author: '作者A',
            year: 2000,
            category: '昆曲',
            ossKey: 'test/a1.pdf',
            fileName: 'a1.pdf',
            fileSize: 1000,
            mimeType: 'application/pdf',
            viewCount: 10,
            downloadCount: 5,
            categoryId: testCategoryId
          },
          {
            title: '[TEST] 文献2',
            author: '作者B',
            year: 2001,
            category: '京剧',
            ossKey: 'test/a2.pdf',
            fileName: 'a2.pdf',
            fileSize: 2000,
            mimeType: 'application/pdf',
            viewCount: 20,
            downloadCount: 10,
            categoryId: testCategoryId
          },
          {
            title: '[TEST] 文献3',
            author: '作者A',
            year: 2002,
            category: '昆曲',
            ossKey: 'test/a3.pdf',
            fileName: 'a3.pdf',
            fileSize: 3000,
            mimeType: 'application/pdf',
            viewCount: 30,
            downloadCount: 15,
            categoryId: testCategoryId
          }
        ]
      });
    });

    it('should count literatures by category', async () => {
      const count = await prisma.literature.count({
        where: {
          categoryId: testCategoryId
        }
      });

      expect(count).toBe(3);
    });

    it('should aggregate view counts', async () => {
      const result = await prisma.literature.aggregate({
        where: {
          categoryId: testCategoryId
        },
        _sum: {
          viewCount: true,
          downloadCount: true
        },
        _avg: {
          viewCount: true,
          fileSize: true
        },
        _min: {
          year: true
        },
        _max: {
          year: true
        }
      });

      expect(result._sum.viewCount).toBe(60); // 10 + 20 + 30
      expect(result._sum.downloadCount).toBe(30); // 5 + 10 + 15
      expect(result._avg.viewCount).toBe(20); // (10 + 20 + 30) / 3
      expect(result._min.year).toBe(2000);
      expect(result._max.year).toBe(2002);
    });

    it('should group by author', async () => {
      const result = await prisma.literature.groupBy({
        where: {
          categoryId: testCategoryId
        },
        by: ['author'],
        _count: {
          author: true
        },
        _sum: {
          viewCount: true
        }
      });

      expect(result).toHaveLength(2);
      expect(result.find(r => r.author === '作者A')?._count.author).toBe(2);
      expect(result.find(r => r.author === '作者A')?._sum.viewCount).toBe(40); // 10 + 30
      expect(result.find(r => r.author === '作者B')?._count.author).toBe(1);
      expect(result.find(r => r.author === '作者B')?._sum.viewCount).toBe(20);
    });
  });
});
