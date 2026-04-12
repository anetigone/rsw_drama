# 西南剧展文献管理系统 - 后端设计文档

## 技术栈

### 核心框架
- **Node.js** (v18+)
- **Express.js** (v4.18+) - Web 框架
- **TypeScript** - 类型安全

### 数据库
- **SQLite3** - 轻量级关系数据库
- **Prisma** - 现代 ORM，类型安全的数据库访问

### 文件存储
- **阿里云 OSS** - 对象存储服务
- **@aws-sdk/client-s3** - OSS SDK (兼容 S3 协议)

### 工具库
- **multer** - 文件上传处理
- **cors** - 跨域支持
- **dotenv** - 环境变量管理
- **zod** - 数据验证
- **jsonwebtoken** - JWT 认证（可选）

## 项目结构

```
backend/
├── src/
│   ├── index.ts              # 应用入口
│   ├── config/               # 配置文件
│   │   ├── database.ts       # 数据库配置
│   │   ├── oss.ts            # OSS 配置
│   │   └── env.ts            # 环境变量验证
│   ├── routes/               # 路由定义
│   │   ├── literature.ts     # 文献路由
│   │   ├── upload.ts         # 上传路由
│   │   └── index.ts          # 路由聚合
│   ├── controllers/          # 业务逻辑
│   │   ├── literature.controller.ts
│   │   └── upload.controller.ts
│   ├── services/             # 服务层
│   │   ├── literature.service.ts
│   │   ├── oss.service.ts    # OSS 服务
│   │   └── cache.service.ts  # 缓存服务
│   ├── middleware/           # 中间件
│   │   ├── error.handler.ts  # 错误处理
│   │   ├── validation.ts     # 数据验证
│   │   └── auth.ts           # 认证中间件（可选）
│   ├── models/               # 数据模型（由 Prisma 生成）
│   │   └── schema.prisma     # Prisma Schema
│   ├── types/                # TypeScript 类型定义
│   │   └── index.ts
│   └── utils/                # 工具函数
│       ├── logger.ts         # 日志工具
│       └── response.ts       # 统一响应格式
├── prisma/
│   └── schema.prisma         # 数据库模型定义
├── uploads/                  # 临时上传目录
├── .env                      # 环境变量
├── .env.example              # 环境变量示例
├── package.json
├── tsconfig.json
└── README.md
```

## 数据库设计

### Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// 文献表
model Literature {
  id            String   @id @default(uuid())
  title         String
  author        String
  year          Int
  description   String?
  category      String
  ossKey        String   @unique // OSS 存储键
  fileName      String   // 原始文件名
  fileSize      Int      // 文件大小（字节）
  mimeType      String   // MIME 类型
  totalPages    Int?     // PDF 总页数（可选）
  uploadDate    DateTime @default(now())
  updateDate    DateTime @updatedAt
  viewCount     Int      @default(0) // 浏览次数
  downloadCount Int      @default(0) // 下载次数

  @@index([category])
  @@index([uploadDate])
  @@index([author])
}

// 分类表（可选，用于扩展）
model Category {
  id          String    @id @default(uuid())
  name        String    @unique
  description String?
  sortOrder   Int       @default(0)
  createdAt   DateTime  @default(now())

  literatures Literature[]
}

// 用户表（如果需要认证）
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String   // 哈希后的密码
  role      String   @default("user") // admin, user
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## API 接口文档

### 基础信息

- **Base URL**: `http://localhost:3000/api`
- **响应格式**: JSON
- **认证方式**: 暂无（可扩展 JWT）

### 统一响应格式

```typescript
// 成功响应
{
  "success": true,
  "data": any,
  "message": "操作成功"
}

// 错误响应
{
  "success": false,
  "error": {
    "code": string,
    "message": string,
    "details?: any
  }
}

// 分页响应
{
  "success": true,
  "data": {
    "items": any[],
    "pagination": {
      "page": number,
      "pageSize": number,
      "total": number,
      "totalPages": number
    }
  }
}
```

---

## 1. 文献管理接口

### 1.1 获取文献列表

```http
GET /api/literatures
```

**Query 参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认 1 |
| pageSize | number | 否 | 每页数量，默认 10 |
| category | string | 否 | 分类筛选 |
| author | string | 否 | 作者筛选 |
| keyword | string | 否 | 关键词搜索（标题、描述） |
| sortBy | string | 否 | 排序字段：uploadDate, viewCount, title |
| sortOrder | string | 否 | 排序方向：asc, desc，默认 desc |

**响应示例：**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "1",
        "title": "西南剧展史论",
        "author": "张骏祥",
        "year": 1944,
        "description": "西南剧展的历史回顾与理论分析",
        "category": "史论",
        "totalPages": 256,
        "uploadDate": "2024-01-15T10:30:00Z",
        "viewCount": 120,
        "downloadCount": 45
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 45,
      "totalPages": 5
    }
  }
}
```

### 1.2 获取文献详情

```http
GET /api/literatures/:id
```

**路径参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 文献 ID |

**响应示例：**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "title": "西南剧展史论",
    "author": "张骏祥",
    "year": 1944,
    "description": "西南剧展的历史回顾与理论分析",
    "category": "史论",
    "totalPages": 256,
    "uploadDate": "2024-01-15T10:30:00Z",
    "updateDate": "2024-01-15T10:30:00Z",
    "viewCount": 120,
    "downloadCount": 45,
    "fileSize": 15728640,
    "mimeType": "application/pdf"
  }
}
```

### 1.3 创建文献

```http
POST /api/literatures
```

**请求体：**
```json
{
  "title": "西南剧展史论",
  "author": "张骏祥",
  "year": 1944,
  "description": "西南剧展的历史回顾与理论分析",
  "category": "史论",
  "ossKey": "literatures/2024/01/southwest-theatre.pdf",
  "fileName": "southwest-theatre.pdf",
  "fileSize": 15728640,
  "mimeType": "application/pdf",
  "totalPages": 256
}
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "title": "西南剧展史论",
    // ... 其他字段
  },
  "message": "文献创建成功"
}
```

### 1.4 更新文献

```http
PUT /api/literatures/:id
```

**路径参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 文献 ID |

**请求体：**（所有字段可选）
```json
{
  "title": "西南剧展史论（修订版）",
  "description": "更新后的描述",
  "category": "理论"
}
```

### 1.5 删除文献

```http
DELETE /api/literatures/:id
```

**响应示例：**
```json
{
  "success": true,
  "message": "文献删除成功"
}
```

### 1.6 增加浏览次数

```http
POST /api/literatures/:id/view
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "viewCount": 121
  }
}
```

### 1.7 增加下载次数

```http
POST /api/literatures/:id/download
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "downloadCount": 46
  }
}
```

---

## 2. 文件上传接口

### 2.1 获取上传凭证

```http
POST /api/upload/presigned-url
```

**请求体：**
```json
{
  "fileName": "document.pdf",
  "fileSize": 15728640,
  "contentType": "application/pdf"
}
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "uploadUrl": "https://newsouthwest-literature.oss-cn-beijing.aliyuncs.com/...",
    "ossKey": "literatures/2024/01/uuid-document.pdf",
    "expiresIn": 3600
  }
}
```

### 2.2 确认上传完成

```http
POST /api/upload/confirm
```

**请求体：**
```json
{
  "ossKey": "literatures/2024/01/uuid-document.pdf",
  "metadata": {
    "title": "西南剧展史论",
    "author": "张骏祥",
    "year": 1944,
    "category": "史论"
  }
}
```

**说明：** 上传完成后调用此接口创建文献记录

---

## 3. 文件访问接口

### 3.1 获取预签名阅读 URL

```http
GET /api/literatures/:id/read-url
```

**说明：** 返回用于 PDF.js 预览的临时访问 URL

**响应示例：**
```json
{
  "success": true,
  "data": {
    "readUrl": "https://newsouthwest-literature.oss-cn-beijing.aliyuncs.com/literatures/...",
    "expiresIn": 3600
  }
}
```

### 3.2 获取下载 URL

```http
GET /api/literatures/:id/download-url
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "downloadUrl": "https://newsouthwest-literature.oss-cn-beijing.aliyuncs.com/literatures/...",
    "fileName": "西南剧展史论.pdf",
    "expiresIn": 3600
  }
}
```

---

## 4. 分类管理接口

### 4.1 获取所有分类

```http
GET /api/categories
```

**响应示例：**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "史论",
      "description": "历史与理论研究",
      "sortOrder": 1,
      "literatureCount": 15
    }
  ]
}
```

---

## 5. 统计接口

### 5.1 获取统计数据

```http
GET /api/statistics
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "totalLiteratures": 45,
    "totalViews": 5230,
    "totalDownloads": 890,
    "categories": [
      {
        "name": "史论",
        "count": 15
      },
      {
        "name": "理论",
        "count": 12
      }
    ]
  }
}
```

---

## 环境变量配置

### .env.example

```env
# 服务器配置
PORT=3000
NODE_ENV=development

# 数据库
DATABASE_URL="file:./dev.db"

# 阿里云 OSS 配置
OSS_REGION=oss-cn-beijing
OSS_ACCESS_KEY_ID=your_access_key_id
OSS_ACCESS_KEY_SECRET=your_access_key_secret
OSS_BUCKET=newsouthwest-literature
OSS_ENDPOINT=oss-cn-beijing.aliyuncs.com

# CORS 配置
CORS_ORIGIN=http://localhost:5173

# 文件上传配置
MAX_FILE_SIZE=52428800  # 50MB
ALLOWED_FILE_TYPES=application/pdf
```

---

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 409 | 资源冲突（如重复创建） |
| 413 | 文件过大 |
| 415 | 不支持的文件类型 |
| 500 | 服务器错误 |

---

## 部署说明

### 开发环境
```bash
# 安装依赖
npm install

# 初始化数据库
npx prisma generate
npx prisma db push

# 启动开发服务器
npm run dev
```

### 生产环境
```bash
# 构建
npm run build

# 启动
npm start
```

### Docker 部署（推荐）
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "start"]
```

---

## 下一步扩展

1. **用户认证**：添加 JWT 认证，区分管理员和普通用户
2. **缓存机制**：使用 Redis 缓存热点数据
3. **全文搜索**：集成全文搜索引擎
4. **批注功能**：支持 PDF 批注和高亮
5. **版本管理**：文献版本控制
6. **访问日志**：详细的访问和下载日志
7. **备份机制**：自动数据库备份
