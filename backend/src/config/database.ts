// 导出 Prisma 实例
export { prisma } from '../utils/prisma';

// 优雅关闭数据库连接
import { prisma } from '../utils/prisma';

export async function disconnectDatabase() {
  await prisma.$disconnect();
}
