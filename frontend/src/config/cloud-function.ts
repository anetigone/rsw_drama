/**
 * 阿里云EMAS Serverless云函数配置文件
 * 用于配置前端调用的云函数
 */

// 阿里云EMAS Serverless配置
export const EMAS_CONFIG = {
  appId: import.meta.env.VITE_EMAS_APP_ID || '',
  spaceId: import.meta.env.VITE_EMAS_SPACE_ID || '',
  clientSecret: import.meta.env.VITE_EMAS_CLIENT_SECRET || '',
  endpoint: import.meta.env.VITE_EMAS_ENDPOINT || ''
}

// 云函数名称配置
export const CLOUD_FUNCTION_NAMES = {
  LLM_CALLING: 'llm_calling'
}

// 检查EMAS配置是否完整
export const isEMASConfigured = (): boolean => {
  return !!(EMAS_CONFIG.spaceId && EMAS_CONFIG.clientSecret && EMAS_CONFIG.endpoint)
}

// 环境变量说明
/**
 * 在项目根目录创建 .env.local 文件，添加以下配置：
 *
 * # 阿里云EMAS Serverless配置
 * VITE_EMAS_SPACE_ID=your-space-id
 * VITE_EMAS_CLIENT_SECRET=your-client-secret
 * VITE_EMAS_ENDPOINT=https://api.next.bspapp.com
 *
 * 获取方式：
 * 1. 登录EMAS控制台: https://emas.console.aliyun.com
 * 2. 进入Serverless控制台
 * 3. 在服务空间详情中查看上述信息
 */
