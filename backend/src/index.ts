import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { validateEnv } from './config/env';
import { disconnectDatabase } from './config/database';
import routes from './routes';
import { errorHandler } from './middleware/error.handler';
import logger from './utils/logger';

// 加载环境变量
dotenv.config();

// 验证环境变量
const env = validateEnv();

// 创建 Express 应用
const app = express();

// 中间件
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 请求日志中间件
app.use((req, res, next) => {
  logger.debug(`${req.method} ${req.path}`);
  next();
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API 路由
app.use('/api', routes);

// 错误处理中间件
app.use(errorHandler);

// 启动服务器
const PORT = env.PORT;
const server = app.listen(PORT, () => {
  logger.info(`🚀 Server is running on http://localhost:${PORT}`);
  logger.info(`📚 API endpoint: http://localhost:${PORT}/api`);
  logger.info(`🔧 Environment: ${env.NODE_ENV}`);
});

// 优雅关闭
const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}, shutting down gracefully...`);

  server.close(async () => {
    logger.info('Closed HTTP server');

    try {
      await disconnectDatabase();
      logger.info('Disconnected from database');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  });

  // 强制关闭超时
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// 监听退出信号
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// 未捕获的异常
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});
