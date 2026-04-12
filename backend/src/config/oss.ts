import { S3Client } from '@aws-sdk/client-s3';
import { validateEnv } from './env';

const env = validateEnv();

// 创建 S3 客户端(兼容阿里云 OSS)
export const s3Client = new S3Client({
  region: env.OSS_REGION,
  endpoint: `https://${env.OSS_ENDPOINT}`,
  credentials: {
    accessKeyId: env.OSS_ACCESS_KEY_ID,
    secretAccessKey: env.OSS_ACCESS_KEY_SECRET,
  },
  // 阿里云 OSS 需要这个配置
  forcePathStyle: true,
});

export const ossConfig = {
  bucket: env.OSS_BUCKET,
  region: env.OSS_REGION,
  endpoint: env.OSS_ENDPOINT,
};
