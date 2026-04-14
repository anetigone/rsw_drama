# 阿里云 OSS 集成文档

## 概述

本项目使用阿里云官方 OSS Node.js SDK (`ali-oss`) 实现文件存储功能，支持：
- 文件上传（服务端直传和客户端预签名直传）
- 动态生成公开访问 URL
- 预签名 URL（用于临时访问授权）
- 文件删除和管理

## 环境配置

### 1. 安装依赖

```bash
npm install ali-oss @types/ali-oss --save
```

### 2. 配置环境变量

在 `.env` 文件中配置以下变量：

```env
# 阿里云 OSS 配置
OSS_REGION=oss-cn-beijing
OSS_ACCESS_KEY_ID=your_access_key_id
OSS_ACCESS_KEY_SECRET=your_access_key_secret
OSS_BUCKET=newsouthwest-literature
OSS_ENDPOINT=oss-cn-beijing.aliyuncs.com
```

### 3. 获取 AccessKey

1. 登录 [阿里云控制台](https://ram.console.aliyun.com/users/create)
2. 创建 RAM 用户（建议使用 RAM 用户而非主账号）
3. 为用户授予 `AliyunOSSFullAccess` 权限
4. 创建 AccessKey 并保存

## 核心功能

### OSS 配置 (`src/config/oss.ts`)

```typescript
import OSS from 'ali-oss';

export const ossClient = new OSS({
  region: env.OSS_REGION.replace('oss-', ''),
  accessKeyId: env.OSS_ACCESS_KEY_ID,
  accessKeySecret: env.OSS_ACCESS_KEY_SECRET,
  bucket: env.OSS_BUCKET,
  authorizationV4: true, // 使用 V4 签名
});

export const ossConfig = {
  bucket: env.OSS_BUCKET,
  region: env.OSS_REGION,
  endpoint: env.OSS_ENDPOINT,
  publicUrlBase: `https://${env.OSS_BUCKET}.${env.OSS_ENDPOINT}`,
};
```

### OSS 服务 (`src/services/oss.service.ts`)

#### 主要方法：

1. **上传文件** - `uploadFile(fileName, fileBuffer, contentType)`
   - 直接上传文件到 OSS
   - 返回 ossKey 和公共访问 URL

2. **生成预签名上传 URL** - `generatePresignedUploadUrl(fileName, contentType, expiresIn)`
   - 用于客户端直传
   - 默认有效期 3600 秒（1 小时）

3. **生成预签名阅读 URL** - `generatePresignedReadUrl(ossKey, expiresIn)`
   - 用于临时访问授权
   - 适用于私有文件或需要权限控制的场景

4. **获取公共 URL** - `getPublicUrl(ossKey)`
   - 返回永久有效的公开访问 URL
   - 文件需要设置为公共读权限

5. **删除文件** - `deleteFile(ossKey)` / `deleteFiles(ossKeys[])`

6. **检查文件存在** - `fileExists(ossKey)`

7. **获取文件信息** - `getFileInfo(ossKey)`

### 文件上传流程

#### 方案一：服务端直传

```typescript
// 在服务端接收文件并上传
const fileBuffer = req.file.buffer;
const result = await ossService.uploadFile(
  'example.pdf',
  fileBuffer,
  'application/pdf'
);
// result.ossKey - OSS 存储路径
// result.publicUrl - 公共访问 URL
```

#### 方案二：客户端预签名直传（推荐）

1. **获取预签名 URL**
   ```http
   POST /api/upload/presigned-url
   Body: {
     "fileName": "example.pdf",
     "fileSize": 1234567,
     "contentType": "application/pdf"
   }
   ```

2. **客户端直接上传到 OSS**
   ```typescript
   // 使用返回的 uploadUrl 直接上传
   await fetch(uploadUrl, {
     method: 'PUT',
     body: file,
     headers: { 'Content-Type': 'application/pdf' }
   });
   ```

3. **确认上传并创建数据库记录**
   ```http
   POST /api/upload/confirm
   Body: {
     "ossKey": "literatures/2024/01/uuid.pdf",
     "metadata": {
       "title": "文献标题",
       "author": "作者",
       "year": 2024,
       "category": "分类"
     },
     "fileInfo": {
       "fileName": "example.pdf",
       "fileSize": 1234567
     }
   }
   ```

### 文件访问 URL

文献对象包含动态生成的 URL：

```typescript
{
  "id": "uuid",
  "title": "文献标题",
  "ossKey": "literatures/2024/01/uuid.pdf",
  "urls": {
    "public": "https://bucket.oss-cn-beijing.aliyuncs.com/literatures/2024/01/uuid.pdf",
    "read": null, // 可通过 /api/literatures/:id/read 获取预签名 URL
    "download": "/api/literatures/:id/download"
  }
}
```

#### 获取预签名阅读 URL

```http
GET /api/literatures/:id/read
```

返回：
```json
{
  "success": true,
  "data": {
    "readUrl": "https://bucket.oss-cn-beijing.aliyuncs.com/...?signature=...",
    "expiresIn": 3600,
    "fileName": "example.pdf"
  }
}
```

#### 获取下载 URL（增加下载计数）

```http
GET /api/literatures/:id/download
```

## 文件组织结构

上传的文件按以下组织结构存储：

```
bucket/
└── literatures/
    ├── 2024/
    │   ├── 01/
    │   │   ├── uuid-1.pdf
    │   │   └── uuid-2.pdf
    │   └── 02/
    │       └── uuid-3.pdf
    └── 2025/
        └── 01/
            └── uuid-4.pdf
```

## 权限控制

### 公共读权限
- 上传时设置 `x-oss-object-acl: 'public-read'`
- 文件可通过公共 URL 直接访问
- 适用于公开文献

### 私有权限
- 不设置公共读权限
- 只能通过预签名 URL 访问
- 适用于需要权限控制的文献

## 数据库记录

每个上传的文件在数据库中都有对应记录：

```prisma
model Literature {
  id            String    @id @default(uuid())
  title         String
  author        String
  year          Int
  description   String?
  category      String
  ossKey        String    @unique  // OSS 存储路径
  fileName      String              // 原始文件名
  fileSize      Int                 // 文件大小（字节）
  mimeType      String              // MIME 类型
  totalPages    Int?
  uploadDate    DateTime  @default(now())
  viewCount     Int       @default(0)
  downloadCount Int       @default(0)
}
```

## 错误处理

常见错误码：

- `NoSuchKey` - 文件不存在
- `AccessDenied` - 访问被拒绝（权限问题）
- `InvalidArgument` - 参数错误

## 清理和维护

### 删除文献时同步删除 OSS 文件

```typescript
// literature.controller.ts - deleteLiterature
const literature = await literatureService.deleteLiterature(id);

// 同步删除 OSS 文件
try {
  await ossService.deleteFile(literature.ossKey);
} catch (error) {
  logger.error(`Failed to delete OSS file: ${literature.ossKey}`, error);
  // 即使 OSS 删除失败，数据库记录已删除
}
```

## 性能优化

1. **使用 CDN**：配置阿里云 CDN 加速 OSS 访问
2. **客户端直传**：减少服务端带宽压力
3. **预签名 URL**：避免通过服务端转发文件流
4. **图片缩略图**：使用 OSS 图片处理功能

## 安全建议

1. **使用 RAM 用户**：不要使用主账号 AccessKey
2. **最小权限原则**：只授予必要的 OSS 权限
3. **定期轮换 AccessKey**：建议每 90 天轮换一次
4. **使用 V4 签名**：更安全的签名算法（已启用）
5. **启用日志审计**：记录所有 OSS 操作

## 相关文档

- [阿里云 OSS Node.js SDK](https://help.aliyun.com/zh/oss/developer-reference/node-js-2)
- [OSS 管理控制台](https://oss.console.aliyun.com/)
- [RAM 访问控制](https://ram.console.aliyun.com/)
