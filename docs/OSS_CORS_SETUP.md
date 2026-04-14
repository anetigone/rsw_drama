# 阿里云 OSS CORS 配置指南

## 问题说明

前端（localhost:5173）向 OSS 发送预签名 PUT 请求时，浏览器会先发送 OPTIONS 预检请求。如果 CORS 配置不正确，会导致：

```
Access to XMLHttpRequest at 'https://bucket.oss-cn-beijing.aliyuncs.com/...'
from origin 'http://localhost:5173' has been blocked by CORS policy:
Response to preflight request doesn't pass access control check:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## 完整 CORS 配置

### 1. 登录阿里云 OSS 控制台

1. 访问：https://oss.console.aliyun.com/
2. 选择 Bucket: `newsouthwest-literature`
3. 左侧菜单 → **权限管理** → **跨域设置（CORS）**

### 2. 创建 CORS 规则

点击「设置」→「创建规则」，填写以下内容：

#### 规则配置

| 配置项 | 值 | 说明 |
|--------|-----|------|
| **来源** | `http://localhost:5173`<br>`http://localhost:5174`<br>`http://localhost:3000`<br>`https://newsouthwest.cn` | 每行一个，或用逗号分隔 |
| **允许 Methods** | `GET, POST, PUT, DELETE, HEAD` | 必须包含 PUT（用于上传） |
| **允许 Headers** | `*` | **关键！必须设置为星号** |
| **暴露 Headers** | `ETag`<br>`x-oss-request-id` | 每行一个 |
| **缓存时间** | `3600` | 秒（1小时） |

### 3. 重要配置说明

#### 来源（AllowedOrigin）
```
http://localhost:5173
https://newsouthwest.cn
```
- **必须包含端口号**：`http://localhost:5173` 而不是 `http://localhost`
- 如果使用其他端口，也要添加：`http://localhost:5174`

#### 允许 Methods（AllowedMethod）
```
GET, POST, PUT, DELETE, HEAD
```
- **必须包含 PUT**：用于文件上传
- 必须包含 **OPTIONS**（虽然控制台可能不显示，但阿里云会自动处理）

#### 允许 Headers（AllowedHeader）
```
*
```
- **这是最关键的配置！**
- 不能只写 `Content-Type`，必须设置为 `*`
- 预检请求会发送各种 headers，只有 `*` 能全部覆盖

#### 暴露 Headers（ExposeHeader）
```
ETag
x-oss-request-id
```
- 允许前端读取这些响应头
- `ETag` 用于验证上传完整性

### 4. 开发环境临时配置（最宽松）

如果配置后仍有问题，可以使用这个配置（仅开发环境）：

```
来源: *
允许 Methods: GET, POST, PUT, DELETE, HEAD
允许 Headers: *
暴露 Headers: *
缓存时间: 3600
```

⚠️ **警告：** 生产环境必须指定具体的域名，不能使用 `*`！

### 5. 配置验证

配置完成后，等待 **1-2 分钟**让规则生效，然后验证：

#### 方法1：使用 curl 测试预检请求

```bash
curl -v -X OPTIONS \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: PUT" \
  -H "Access-Control-Request-Headers: content-type" \
  http://newsouthwest-literature.oss-cn-beijing.aliyuncs.com/test
```

**期望响应：**
```
HTTP/1.1 200 OK
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, HEAD
Access-Control-Allow-Headers: *
Access-Control-Max-Age: 3600
```

#### 方法2：浏览器控制台测试

在浏览器开发者工具的 Network 标签中查看 OPTIONS 请求：

1. 打开 http://localhost:5173
2. 尝试上传文件
3. 查看 Network 标签中的 OPTIONS 请求
4. 检查 Response Headers 是否包含：
   - `access-control-allow-origin: http://localhost:5173`
   - `access-control-allow-headers: *`

### 6. 常见问题排查

#### 问题1：仍然收到 CORS 错误

**原因：** 配置还未生效或配置不正确

**解决：**
1. 等待 2-3 分钟
2. 检查配置是否完全按照上述表格填写
3. 确认「允许 Headers」确实是 `*` 而不是其他值

#### 问题2：OPTIONS 请求返回 403

**原因：** CORS 规则中的来源不匹配

**解决：**
- 检查来源是否包含端口号：`http://localhost:5173`
- 不要使用通配符域名如 `http://localhost.*`

#### 问题3：PUT 请求被阻止

**原因：** 允许 Methods 中缺少 PUT

**解决：**
- 确保允许 Methods 包含 `GET, POST, PUT, DELETE, HEAD`

#### 问题4：无法读取 ETag

**原因：** 暴露 Headers 中缺少 ETag

**解决：**
- 在暴露 Headers 中添加 `ETag`

### 7. 阿里云控制台截图示例

```
┌─────────────────────────────────────────────────────────┐
│  跨域设置 (CORS)                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  来源: http://localhost:5173                            │
│        https://newsouthwest.cn                          │
│                                                         │
│  允许 Methods:  ✓ GET  ✓ POST  ✓ PUT  ✓ DELETE  ✓ HEAD│
│                                                         │
│  允许 Headers: *                                        │
│                                                         │
│  暴露 Headers: ETag                                     │
│               x-oss-request-id                          │
│                                                         │
│  缓存时间 (秒): 3600                                    │
│                                                         │
│  [保存] [取消]                                          │
└─────────────────────────────────────────────────────────┘
```

### 8. 完整配置示例（JSON 格式）

如果使用阿里云 CLI 或 SDK 配置：

```json
{
  "CORSRules": [
    {
      "AllowedOrigins": [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "https://newsouthwest.cn"
      ],
      "AllowedMethods": [
        "GET",
        "POST",
        "PUT",
        "DELETE",
        "HEAD"
      ],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": [
        "ETag",
        "x-oss-request-id"
      ],
      "MaxAgeSeconds": 3600
    }
  ]
}
```

### 9. 验证配置生效

配置正确的表现：

1. **预检请求（OPTIONS）成功**
   ```
   Request URL: http://bucket.oss-cn-beijing.aliyuncs.com/file.pdf?...
   Request Method: OPTIONS
   Status Code: 200 OK
   ```

2. **实际上传请求（PUT）成功**
   ```
   Request URL: http://bucket.oss-cn-beijing.aliyuncs.com/file.pdf?...
   Request Method: PUT
   Status Code: 200 OK
   ```

3. **浏览器控制台无 CORS 错误**

### 10. 生产环境配置

生产环境应该使用更严格的配置：

```
来源: https://newsouthwest.cn
允许 Methods: GET, POST, PUT, DELETE, HEAD
允许 Headers: *
暴露 Headers: ETag, x-oss-request-id
缓存时间: 3600
```

---

## 相关文档

- [阿里云 OSS CORS 配置官方文档](https://help.aliyun.com/zh/oss/developer-reference/cors-1)
- [MDN - CORS 预检请求](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CORS#Preflighted_requests)
