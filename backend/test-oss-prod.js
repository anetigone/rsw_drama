#!/usr/bin/env node
/**
 * OSS 服务测试脚本 - 生产环境版本
 * 这个脚本会自动查找并加载 .env 文件
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 尝试多个可能的 .env 文件位置
const envPaths = [
  path.resolve(__dirname, '.env'),           // 当前目录
  path.resolve(__dirname, '../.env'),        // 上级目录
  path.resolve(process.cwd(), '.env'),       // 当前工作目录
  '/root/dev/rsw_drama/rsw_drama-master/backend/.env'  // 你提到的工作目录
];

let envLoaded = false;
for (const envPath of envPaths) {
  try {
    const result = dotenv.config({ path: envPath });
    if (result.error) {
      throw result.error;
    }
    console.log(`✓ 已加载 .env 文件: ${envPath}`);
    envLoaded = true;
    break;
  } catch (error) {
    // 继续尝试下一个路径
    continue;
  }
}

if (!envLoaded) {
  console.error('❌ 无法找到 .env 文件，尝试过的路径:');
  envPaths.forEach(p => console.log(`  - ${p}`));
  console.error('\n请确保 .env 文件存在于以下位置之一:');
  console.error('  1. ', path.resolve(__dirname, '.env'));
  console.error('  2. ', path.resolve(process.cwd(), '.env'));
  process.exit(1);
}

// 打印当前工作目录和关键环境变量（脱敏）
console.log('当前工作目录:', process.cwd());
console.log('Node.js 版本:', process.version);
console.log('');

// 验证关键环境变量是否加载
const requiredVars = ['OSS_ACCESS_KEY_ID', 'OSS_ACCESS_KEY_SECRET', 'OSS_BUCKET_NAME'];
const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ 缺少必需的环境变量:');
  missingVars.forEach(varName => console.error(`  - ${varName}`));
  console.error('\n请检查你的 .env 文件是否包含这些变量。');
  process.exit(1);
}

console.log('✓ 环境变量检查通过');
console.log('');

// 现在导入测试模块
try {
  const testModule = await import('./src/test/test-oss-service.ts');
  console.log('✓ 测试模块加载成功\n');
} catch (error) {
  console.error('❌ 加载测试模块失败:', error.message);
  console.error('详情:', error);
  process.exit(1);
}
