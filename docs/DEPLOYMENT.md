# 西南剧展文献管理系统 - 部署指南

## 目录结构说明

采用 **Monorepo 结构**，前后端放在同一个仓库中：

```
rsw_drama/
├── frontend/              # Vue 前端项目
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/               # Express 后端项目（需要创建）
│   ├── src/
│   ├── prisma/
│   └── package.json
│
├── docker/                # Docker 配置文件
│   ├── docker-compose.yml         # 生产环境
│   ├── docker-compose.dev.yml     # 开发环境
│   ├── backend.Dockerfile
│   ├── frontend.Dockerfile
│   ├── nginx.conf
│   └── .env.example
│
├── docs/                  # 文档
│   ├── BACKEND_DESIGN.md
│   └── DEPLOYMENT.md     # 本文件
│
└── README.md
```

---

## 准备工作

### 1. 服务器要求

- **操作系统**：Linux（推荐 Ubuntu 20.04+）
- **内存**：最低 1GB，推荐 2GB+
- **硬盘**：最低 10GB 可用空间
- **软件**：Docker 20.10+，Docker Compose 2.0+

### 2. 安装 Docker 和 Docker Compose

```bash
# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 验证安装
docker --version
docker-compose --version
```

### 3. 配置阿里云 OSS

确保你的 OSS Bucket 已配置：
- **CORS 规则**：允许你的域名访问
- **访问权限**：公共读或私有（推荐私有，使用签名 URL）
- **地域**：选择离服务器最近的地域

---

## 部署步骤

### 方式一：生产环境部署

#### 1. 准备环境变量文件

```bash
# 在 docker 目录下创建 .env 文件
cd docker
cp .env.example .env
nano .env
```

编辑 `.env` 文件，填入你的 OSS 配置：

```env
OSS_REGION=oss-cn-beijing
OSS_ACCESS_KEY_ID=你的AccessKeyId
OSS_ACCESS_KEY_SECRET=你的AccessKeySecret
OSS_BUCKET=newsouthwest-literature
OSS_ENDPOINT=oss-cn-beijing.aliyuncs.com
```

#### 2. 修改 docker-compose.yml

根据你的域名修改配置：

```yaml
# frontend 服务中的环境变量
args:
  - VITE_API_BASE_URL=https://api.your-domain.com

# backend 服务中的环境变量
- CORS_ORIGIN=https://your-domain.com
```

#### 3. 构建和启动

```bash
# 进入 docker 目录
cd docker

# 构建并启动所有服务
docker-compose up -d --build

# 查看日志
docker-compose logs -f

# 查看服务状态
docker-compose ps
```

#### 4. 配置 Nginx 反向代理（可选）

如果你想使用自己的域名，可以配置 Nginx：

```nginx
# /etc/nginx/sites-available/rsw-drama
server {
    listen 80;
    server_name your-domain.com;

    # 前端
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # API 代理
    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

### 方式二：开发环境部署

```bash
# 进入 docker 目录
cd docker

# 使用开发环境配置
docker-compose -f docker-compose.dev.yml up -d --build

# 查看开发服务日志
docker-compose -f docker-compose.dev.yml logs -f backend-dev
docker-compose -f docker-compose.dev.yml logs -f frontend-dev
```

开发环境特点：
- 支持热重载
- 源代码挂载到容器
- 详细错误日志
- 端口映射：后端 3000，前端 5173

---

## 常用命令

### Docker Compose 命令

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 查看日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend

# 进入容器
docker-compose exec backend sh
docker-compose exec frontend sh

# 更新服务
docker-compose pull
docker-compose up -d --build

# 清理所有资源
docker-compose down -v
```

### 数据库管理

```bash
# 进入后端容器
docker-compose exec backend sh

# 运行 Prisma 命令
npx prisma studio          # 打开数据库管理界面
npx prisma db seed         # 运行种子数据
npx prisma db push         # 同步数据库结构
```

---

## SSL/HTTPS 配置（推荐）

### 使用 Let's Encrypt 免费证书

#### 1. 安装 Certbot

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx
```

#### 2. 获取证书

```bash
sudo certbot --nginx -d your-domain.com
```

#### 3. 自动续期

```bash
sudo certbot renew --dry-run
```

Certbot 会自动配置 Nginx SSL。

---

## 监控和维护

### 健康检查

```bash
# 检查服务健康状态
curl http://localhost:3000/api/health  # 后端
curl http://localhost:80/health         # 前端

# Docker 内置健康检查
docker-compose ps
```

### 日志管理

```bash
# 查看实时日志
docker-compose logs -f

# 保存日志到文件
docker-compose logs > logs.txt

# 清理旧日志
docker system prune -a
```

### 备份

```bash
# 备份数据库
docker-compose exec backend cp /app/data/prod.db /app/backup/prod.db

# 备份到宿主机
docker cp rsw_drama_backend:/app/data/prod.db ./backup/

# 定期备份脚本
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker cp rsw_drama_backend:/app/data/prod.db ./backup/prod_$DATE.db
find ./backup -name "prod_*.db" -mtime +7 -delete
```

---

## 性能优化

### 1. 资源限制

在 `docker-compose.yml` 中添加资源限制：

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### 2. Nginx 缓存配置

```nginx
# 添加到 nginx.conf
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g inactive=60m;

location /api/ {
    proxy_cache my_cache;
    proxy_cache_valid 200 10m;
    proxy_cache_use_stale error timeout updating;
}
```

### 3. 日志轮转

```bash
# /etc/logrotate.d/docker-containers
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    missingok
    delaycompress
    copytruncate
}
```

---

## 故障排查

### 常见问题

#### 1. 服务无法启动

```bash
# 查看详细日志
docker-compose logs backend
docker-compose logs frontend

# 检查端口占用
sudo netstat -tlnp | grep :3000
sudo netstat -tlnp | grep :80
```

#### 2. OSS 连接失败

- 检查 `.env` 文件配置
- 确认 OSS Bucket 存在且可访问
- 检查服务器网络连接

#### 3. 数据库错误

```bash
# 重新初始化数据库
docker-compose exec backend npx prisma db push

# 查看数据库文件
docker-compose exec backend ls -lh /app/data/
```

#### 4. 前端无法访问后端 API

- 检查 CORS 配置
- 确认 API_BASE_URL 正确
- 查看网络请求是否被代理

---

## 安全建议

1. **使用强密码**：所有密码和密钥使用复杂随机字符串
2. **启用 HTTPS**：使用 SSL 证书加密传输
3. **限制访问**：配置防火墙规则
4. **定期更新**：保持 Docker 和系统更新
5. **备份策略**：定期备份数据库和配置
6. **监控日志**：定期检查访问和错误日志

---

## 成本估算

### 服务器成本

- **轻量应用服务器**：¥50-100/月（1核2G）
- **云服务器 ECS**：¥100-200/月（2核4G）

### OSS 成本

- **存储费用**：¥0.12/GB/月
- **流量费用**：¥0.5/GB（外网下行）
- **请求费用**：¥0.01/万次

**示例**：100GB 存储 + 100GB 流量 ≈ ¥56/月

---

## 下一步

1. 创建后端项目结构
2. 实现 API 接口
3. 配置 CI/CD 自动部署
4. 设置监控告警
5. 优化性能和成本

需要我帮你创建后端项目吗？
