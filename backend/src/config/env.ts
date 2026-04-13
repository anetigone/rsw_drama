import { z } from 'zod';

const envSchema = z.object({
  // 服务器配置
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000').transform(v => Number(v)),

  // 数据库
  DATABASE_URL: z.string().default('file:./dev.db'),

  // 阿里云 OSS 配置
  OSS_REGION: z.string().default('oss-cn-beijing'),
  OSS_ACCESS_KEY_ID: z.string(),
  OSS_ACCESS_KEY_SECRET: z.string(),
  OSS_BUCKET_NAME: z.string(),
  OSS_ENDPOINT: z.string().default('oss-cn-beijing.aliyuncs.com'),

  // CORS 配置
  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  // 文件上传配置
  MAX_FILE_SIZE: z.string().default('52428800').transform(v => Number(v)), // 50MB
  ALLOWED_FILE_TYPES: z.string().default('application/pdf'),

  // 认证配置
  JWT_SECRET: z.string(),
  ADMIN_PASSWORD: z.string(),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues
        .filter((e: any) => e.code === 'invalid_type')
        .map((e: any) => `  - ${e.path.join('.')}: ${e.message}`)
        .join('\n');

      console.error('❌ Missing or invalid environment variables:\n' + missingVars);
      console.error('\nPlease check your .env file.\n');
      process.exit(1);
    }
    throw error;
  }
}
