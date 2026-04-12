# 多阶段构建 - 后端 Dockerfile

# ==================== 开发阶段 ====================
FROM node:18-alpine AS development

WORKDIR /app

# 安装开发依赖
COPY backend/package*.json ./backend/
COPY backend/tsconfig.json ./backend/

RUN cd backend && npm ci

# 复制源代码
COPY backend/src ./backend/src
COPY backend/prisma ./backend/prisma

# 生成 Prisma Client
WORKDIR /app/backend
RUN npx prisma generate

# 开发环境默认命令
CMD ["npm", "run", "dev"]

# ==================== 构建阶段 ====================
FROM node:18-alpine AS builder

WORKDIR /app

# 安装依赖
COPY backend/package*.json ./
RUN npm ci

# 复制源代码和 Prisma
COPY backend/tsconfig.json ./
COPY backend/src ./src
COPY backend/prisma ./prisma

# 生成 Prisma Client
RUN npx prisma generate

# 构建 TypeScript
RUN npm run build

# ==================== 生产阶段 ====================
FROM node:18-alpine AS production

WORKDIR /app

# 安装生产依赖
COPY backend/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# 从构建阶段复制构建产物
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

# 创建数据目录
RUN mkdir -p /app/data /app/uploads

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/api/health || exit 1

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["node", "dist/index.js"]
