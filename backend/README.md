# 西南剧展文献管理系统 - 后端服务

基于 Node.js + Express + TypeScript + Prisma + SQLite + 阿里云 OSS 的文献管理系统后端服务。

## 技术栈

- **Node.js** (v18+) - 运行时环境
- **Express.js** - Web 框架
- **TypeScript** - 类型安全
- **Prisma** - 现代 ORM
- **SQLite** - 轻量级关系数据库
- **阿里云 OSS** - 对象存储服务
- **Zod** - 数据验证

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
│   ├── controllers/          # 业务逻辑
│   ├── services/             # 服务层
│   ├── middleware/           # 中间件
│   ├── types/                # TypeScript 类型定义
│   └── utils/                # 工具函数
├── prisma/
│   └── schema.prisma         # 数据库模型定义
├── .env                      # 环境变量
├── .env.example              # 环境变量示例
├── package.json
├── tsconfig.json
└── README.md
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并填写配置:

```bash
cp .env.example .env
```

编辑 `.env` 文件,填写你的阿里云 OSS 配置:

```env
OSS_ACCESS_KEY_ID=your_access_key_id
OSS_ACCESS_KEY_SECRET=your_access_key_secret
OSS_BUCKET=your_bucket_name
```

### 3. 初始化数据库

```bash
# 生成 Prisma Client
npm run prisma:generate

# 推送数据库结构
npm run prisma:push

# (可选) 使用 Prisma Studio 管理数据库
npm run prisma:studio
```

### 4. 启动开发服务器

```bash
npm run dev
```

服务器将在 http://localhost:3000 启动

### 5. 构建生产版本

```bash
npm run build
npm start
```

## API 文档

详细的 API 文档请参考 [BACKEND_DESIGN.md](../docs/BACKEND_DESIGN.md)

### 基础信息

- **Base URL**: `http://localhost:3000/api`
- **响应格式**: JSON

### 主要接口

#### 文献管理

- `GET /api/literatures` - 获取文献列表
- `GET /api/literatures/:id` - 获取文献详情
- `POST /api/literatures` - 创建文献
- `PUT /api/literatures/:id` - 更新文献
- `DELETE /api/literatures/:id` - 删除文献
- `GET /api/literatures/:id/read-url` - 获取预签名阅读 URL
- `GET /api/literatures/:id/download-url` - 获取下载 URL

#### 文件上传

- `POST /api/upload/presigned-url` - 获取预签名上传 URL
- `POST /api/upload/confirm` - 确认上传完成

#### 统计

- `GET /api/statistics` - 获取统计数据
- `GET /api/categories` - 获取分类列表

## 开发工具

### Prisma Studio

```bash
npm run prisma:studio
```

打开数据库管理界面,可以直观地查看和编辑数据。

### 代码检查

项目使用 TypeScript 进行类型检查,运行构建命令进行检查:

```bash
npm run build
```

## 部署

### 使用 Docker

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

### 环境变量

生产环境需要配置以下环境变量:

- `NODE_ENV=production`
- `DATABASE_URL` - 数据库连接字符串
- `OSS_ACCESS_KEY_ID` - 阿里云 OSS 访问密钥 ID
- `OSS_ACCESS_KEY_SECRET` - 阿里云 OSS 访问密钥
- `OSS_BUCKET` - OSS 存储桶名称
- `OSS_REGION` - OSS 区域
- `OSS_ENDPOINT` - OSS 终端节点
- `CORS_ORIGIN` - 允许的跨域来源

## 注意事项

1. **数据库备份**: 生产环境建议定期备份数据库文件
2. **OSS 安全**: 确保不要将 OSS 密钥提交到版本控制
3. **文件大小**: 默认最大文件大小为 50MB,可在 `.env` 中调整
4. **CORS 配置**: 生产环境需要正确配置 CORS_ORIGIN

## 故障排查

### 数据库连接错误

确保已运行 `npm run prisma:push` 初始化数据库。

### OSS 上传失败

检查 `.env` 中的 OSS 配置是否正确,确保:
- Access Key ID 和 Secret 有效
- Bucket 存在且有正确权限
- Region 和 Endpoint 匹配

### TypeScript 编译错误

运行 `npm run prisma:generate` 重新生成 Prisma Client。

## 许可证

MIT
