// OSS 服务测试启动文件
// 这个文件负责在导入任何模块之前加载环境变量
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

// 动态导入测试模块
import('./test-oss-service').catch(error => {
  console.error('Failed to load test module:', error);
  process.exit(1);
});
