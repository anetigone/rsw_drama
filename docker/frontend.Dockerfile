# 多阶段构建 - 前端 Dockerfile

# ==================== 开发阶段 ====================
FROM node:18-alpine AS development

WORKDIR /app

# 安装开发依赖
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm ci

# 复制源代码
COPY frontend/src ./frontend/src
COPY frontend/public ./frontend/public
COPY frontend/index.html ./frontend/
COPY frontend/vite.config.ts ./frontend/

# 开发环境默认命令
CMD ["npm", "run", "dev"]

# ==================== 构建阶段 ====================
FROM node:18-alpine AS builder

WORKDIR /app

# 安装依赖
COPY frontend/package*.json ./
RUN npm ci

# 复制源代码
COPY frontend/src ./src
COPY frontend/public ./public
COPY frontend/index.html ./
COPY frontend/vite.config.ts ./

# 构建参数（API 地址）
ARG VITE_API_BASE_URL=http://localhost:3000
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# 构建
RUN npm run build

# ==================== 生产阶段 ====================
FROM nginx:alpine AS production

# 安装 wget 用于健康检查
RUN apk add --no-cache wget

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 nginx 配置
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80
EXPOSE 443

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/health || exit 1

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]
