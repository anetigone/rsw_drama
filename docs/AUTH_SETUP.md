# 管理后台认证设置指南

## 概述

管理后台已经添加了完整的 JWT 认证系统,支持多个管理员账号，每个管理员都有独立的用户名和密码。只有通过身份验证的用户才能访问管理功能。

## 后端设置

### 1. 安装依赖

```bash
cd backend
npm install jsonwebtoken bcryptjs
npm install --save-dev @types/jsonwebtoken @types/bcryptjs
```

### 2. 生成管理员配置

使用提供的脚本生成管理员配置。有两种方式：

#### 方式一：交互式生成多个管理员（推荐）

```bash
npm run admin:generate
```

这个脚本会引导你完成：
- 添加多个管理员账号
- 为每个管理员设置用户名、密码和显示名称
- 自动生成密码哈希
- 输出完整的配置供复制到 .env 文件

#### 方式二：添加单个管理员

```bash
npm run admin:add
```

这个脚本用于快速添加一个管理员账号。

### 3. 配置环境变量

在你的 `.env` 文件中添加以下配置:

```env
# JWT 密钥 (至少 32 个字符,建议使用随机字符串)
JWT_SECRET=your_very_secure_jwt_secret_key_at_least_32_characters_long_change_this_in_production

# 管理员配置（JSON 格式的管理员数组）
# 运行 npm run admin:generate 来生成配置
ADMIN_USERS='[{"username":"admin1","password":"$2a$10$...","name":"管理员1"},{"username":"admin2","password":"$2a$10$...","name":"管理员2"}]'
```

**重要提示:**
- JWT_SECRET 应该是一个随机、长且复杂的字符串
- ADMIN_USERS 是一个 JSON 数组，包含所有管理员的信息
- password 字段必须是 bcrypt 哈希值，不是明文密码
- 在生产环境中,请使用环境变量管理工具(如 dotenv-vault)来保护这些敏感信息
- 不要将 `.env` 文件提交到版本控制系统

### 4. 重新生成数据库 (如果需要)

如果你之前已经初始化过数据库,这一步可以跳过。

```bash
cd backend
npx prisma migrate dev
```

## 前端设置

前端需要更新登录界面以支持用户名+密码登录。登录表单需要：

1. 添加用户名输入框
2. 修改 API 调用，传递 username 和 password

### 前端登录示例

```typescript
// 登录 API 调用
const loginApi = async (username: string, password: string) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return response.json();
};
```

### 认证功能特性

1. **自动登录状态检查**
   - 使用 Pinia store 管理认证状态
   - Token 存储在 localStorage 中
   - 页面刷新后自动恢复登录状态
   - 支持多个管理员同时登录

2. **路由守卫**
   - `/admin` 路由需要登录才能访问
   - 未登录用户会被重定向到登录页面
   - 登录后自动跳转回目标页面

3. **Token 自动附加**
   - 所有 API 请求自动附带 Authorization header
   - Token 过期时自动跳转到登录页

## 使用方法

### 添加新管理员

1. 运行配置生成脚本：
   ```bash
   npm run admin:generate  # 添加多个管理员
   # 或
   npm run admin:add       # 添加单个管理员
   ```

2. 按照提示输入管理员信息

3. 将生成的配置更新到 `.env` 文件的 `ADMIN_USERS` 字段

4. 重启后端服务使配置生效

### 登录

1. 访问 `/admin` 或 `/login`
2. 输入你的用户名和密码
3. 登录成功后自动跳转到管理后台

### 退出登录

在管理后台右上角点击"退出登录"按钮

### 管理现有管理员

1. 编辑 `.env` 文件中的 `ADMIN_USERS` 配置
2. 可以添加、删除或修改管理员信息
3. 修改后记得重启后端服务

## API 认证

后端以下路由需要认证:

- `POST /categories` - 创建分类
- `PUT /categories/:id` - 更新分类
- `DELETE /categories/:id` - 删除分类
- `POST /literatures` - 创建文献
- `PUT /literatures/:id` - 更新文献
- `DELETE /literatures/:id` - 删除文献
- `POST /upload/presigned-url` - 获取上传 URL
- `POST /upload/confirm` - 确认上传

以下路由是公开的:

- `GET /categories` - 获取分类列表
- `GET /categories/:id` - 获取单个分类
- `GET /literatures` - 获取文献列表
- `GET /literatures/:id` - 获取单个文献
- `POST /literatures/:id/view` - 增加浏览次数
- `POST /literatures/:id/download` - 增加下载次数
- `GET /literatures/:id/read-url` - 获取阅读 URL
- `GET /literatures/:id/download-url` - 获取下载 URL

## 安全建议

1. **使用强密码**: 密码至少包含 12 个字符,包括大小写字母、数字和特殊字符
2. **定期更换密码**: 建议每 3-6 个月更换一次管理员密码
3. **不同管理员使用不同密码**: 避免所有管理员使用相同密码
4. **HTTPS**: 在生产环境中务必使用 HTTPS
5. **环境变量保护**: 使用 `.gitignore` 确保 `.env` 文件不会被提交
6. **日志监控**: 启用后端日志,监控失败的登录尝试
7. **备份**: 定期备份数据库和配置文件
8. **最小权限原则**: 只给必要的管理员分配账号

## 故障排除

### 登录失败

1. 检查 `.env` 文件是否正确配置
2. 确认 ADMIN_USERS 中的 password 是 bcrypt 哈希值,不是明文密码
3. 检查用户名是否正确
4. 检查后端日志查看具体错误信息

### Token 无效

1. 清除浏览器 localStorage
2. 重新登录
3. 检查 JWT_SECRET 是否与生成 token 时使用的密钥一致

### API 401 错误

1. 确认请求头中包含有效的 Authorization token
2. 检查 token 是否过期(默认 7 天)
3. 验证后端认证中间件是否正确配置
4. 确认管理员账号在 ADMIN_USERS 配置中存在

### 配置格式错误

如果 ADMIN_USERS JSON 格式错误：
1. 使用 JSON 验证工具检查格式
2. 确保使用单引号包裹整个 JSON 字符串
3. 转义内部的双引号
4. 使用提供的脚本生成配置以避免格式错误

## 技术实现

### 后端
- JWT (jsonwebtoken) 用于 token 生成和验证
- bcryptjs 用于密码哈希
- Express 中间件进行请求拦截
- 支持多个管理员账号，每个账号独立认证

### 前端
- Pinia 用于状态管理
- Vue Router 守卫保护路由
- Axios/Fetch 自动附加 token
- 支持用户名+密码登录

## 配置示例

### 示例 .env 配置

```env
# 服务器配置
PORT=3000
NODE_ENV=development

# JWT 配置
JWT_SECRET=your_very_secure_jwt_secret_key_at_least_32_characters_long_change_this_in_production

# 管理员配置
ADMIN_USERS='[
  {"username":"admin","password":"$2a$10$xyz...","name":"系统管理员"},
  {"username":"editor1","password":"$2a$10$abc...","name":"编辑小张"},
  {"username":"editor2","password":"$2a$10$def...","name":"编辑小李"}
]'
```

## 后续改进建议

1. ✅ 多用户支持 - 已实现
2. 实现角色权限管理(RBAC)
3. 添加登录尝试限制
4. 实现密码强度检查
5. 添加双因素认证(2FA)
6. 实现密码重置功能
7. 添加审计日志
8. 管理员账号启用/禁用功能
9. 强制密码过期策略
10. 管理员操作日志记录
