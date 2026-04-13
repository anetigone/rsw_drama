import OSS from 'ali-oss';
import { validateEnv } from './env';

const env = validateEnv();

// 创建阿里云 OSS 客户端
export const ossClient = new OSS({
  // 填写Bucket所在地域
  region: env.OSS_REGION, // 直接使用完整的 region（包含 oss- 前缀）
  // 从环境变量中获取访问凭证
  accessKeyId: env.OSS_ACCESS_KEY_ID,
  accessKeySecret: env.OSS_ACCESS_KEY_SECRET,
  // 填写Bucket名称
  bucket: env.OSS_BUCKET_NAME,
  // 启用V4签名(阿里云推荐)
  authorizationV4: true,
});

// 导出配置信息
export const ossConfig = {
  bucket: env.OSS_BUCKET_NAME,
  region: env.OSS_REGION,
  endpoint: env.OSS_ENDPOINT,
  // 公网访问域名格式: https://bucket-name.endpoint/object-key
  publicUrlBase: `https://${env.OSS_BUCKET_NAME}.${env.OSS_ENDPOINT}`,
};
