# API 测试 curl 命令

## 环境变量设置
```bash
# 根据你的实际配置修改
BASE_URL="http://localhost:3000"
# BASE_URL="https://your-domain.com"
```

---

## 1️⃣ 文献上传流程

### 1.1 获取预签名上传 URL
```bash
curl -X POST "${BASE_URL}/api/upload/presigned-url" \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "test-document.pdf",
    "fileSize": 1024000,
    "contentType": "application/pdf"
  }'
```

**响应示例：**
```json
{
  "success": true,
  "message": "预签名 URL 生成成功",
  "data": {
    "uploadUrl": "https://bucket.oss-cn-hangzhou.aliyuncs.com/...",
    "ossKey": "literatures/2026/04/uuid.pdf",
    "expiresIn": 3600
  }
}
```

### 1.2 使用预签名 URL 上传文件到 OSS（客户端直传）
```bash
# 从上一步的响应中获取 uploadUrl 和 ossKey
UPLOAD_URL="从上一步获取的uploadUrl"
FILE_PATH="./test-document.pdf"

curl -X PUT "http://newsouthwest-literature.oss-cn-beijing.aliyuncs.com/literatures/2026/04/77b73e6c-56c8-4399-89c1-936a389fc191.pdf?x-oss-credential=LTAI5t62MW6imwzMSYtfcD9R%2F20260413%2Fcn-beijing%2Foss%2Faliyun_v4_request&x-oss-date=20260413T094232Z&x-oss-expires=3600&x-oss-signature-version=OSS4-HMAC-SHA256&x-oss-signature=860bd153c064f3935b8468c531c0f30ca18288aa14bcbb091d3eb0aa2e2fd835" -H "Content-Type: application/pdf"  --data-binary "@./test_document.pdf"
```

**成功响应：** OSS 返回的 XML（表示上传成功）

### 1.3 确认上传，创建文献记录
```bash
curl -X POST "${BASE_URL}/api/upload/confirm" -H "Content-Type: application/json" -d '{"ossKey":"literatures/2026/04/77b73e6c-56c8-4399-89c1-936a389fc191.pdf","metadata": {"title": "莎士比亚戏剧研究","author": "张三","year": 2024,"description": "关于莎士比亚四大悲剧的研究论文","category": "戏剧理论","totalPages": 45},"fileInfo": {"fileSize": 1024000,"fileName": "test_document.pdf"}}'
```

**响应示例：**
```json
{
  "success": true,
  "message": "文献创建成功",
  "data": {
    "id": "uuid",
    "title": "莎士比亚戏剧研究",
    "author": "张三",
    "ossKey": "literatures/2026/04/...",
    "urls": {
      "public": "https://bucket.endpoint/...",
      "read": null,
      "download": "/api/literatures/uuid/download"
    }
  }
}
```

---

## 2️⃣ 文献浏览

### 2.1 获取文献列表（分页）
```bash
# 基础查询
curl -X GET "${BASE_URL}/api/literatures"

# 带参数查询
curl -X GET "${BASE_URL}/api/literatures?page=1&pageSize=10&category=戏剧理论&sortBy=uploadDate&sortOrder=desc"

# 搜索关键词
curl -X GET "${BASE_URL}/api/literatures?keyword=莎士比亚"

# 按作者搜索
curl -X GET "${BASE_URL}/api/literatures?author=张三"
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "title": "莎士比亚戏剧研究",
        "author": "张三",
        "year": 2024,
        "category": "戏剧理论",
        "viewCount": 10,
        "downloadCount": 5,
        "uploadDate": "2026-04-13T10:00:00.000Z",
        "urls": {
          "public": "https://bucket.endpoint/literatures/2026/04/...",
          "read": null,
          "download": "/api/literatures/uuid/download"
        }
      }
    ],
    "page": 1,
    "pageSize": 10,
    "total": 25
  }
}
```

### 2.2 获取文献详情
```bash
LITERATURE_ID="从上一步获取的文献ID"

curl -X GET "${BASE_URL}/api/literatures/959fd39f-2ede-423b-9be5-15857aa611b4"
```

**注意：** 此操作会自动增加浏览计数

---

## 3️⃣ 获取预签名 URL

### 3.1 获取阅读 URL（1小时有效）
```bash
curl -X GET "${BASE_URL}/api/literatures/curl -X GET "${BASE_URL}/api/literatures/959fd39f-2ede-423b-9be5-15857aa611b4"/read-url"
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "readUrl": "https://bucket.oss-cn-hangzhou.aliyuncs.com/literatures/...?signature=...",
    "expiresIn": 3600,
    "fileName": "test-document.pdf"
  }
}
```

### 3.2 获取下载 URL（1小时有效，会增加下载计数）
```bash
curl -X GET "${BASE_URL}/api/literatures/${LITERATURE_ID}/download-url"
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "downloadUrl": "https://bucket.oss-cn-hangzhou.aliyuncs.com/literatures/...?signature=...",
    "fileName": "test-document.pdf",
    "expiresIn": 3600
  }
}
```

---

## 4️⃣ 文献管理

### 4.1 更新文献信息
```bash
curl -X PUT "${BASE_URL}/api/literatures/${LITERATURE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "莎士比亚戏剧研究（修订版）",
    "description": "更新后的描述",
    "year": 2025
  }'
```

### 4.2 增加浏览次数（手动触发）
```bash
curl -X POST "${BASE_URL}/api/literatures/${LITERATURE_ID}/view"
```

### 4.3 增加下载次数（手动触发）
```bash
curl -X POST "${BASE_URL}/api/literatures/${LITERATURE_ID}/download"
```

### 4.4 删除文献（同时删除数据库记录和 OSS 文件）
```bash
curl -X DELETE "${BASE_URL}/api/literatures/${LITERATURE_ID}"
```

---

## 5️⃣ 分类和统计

### 5.1 获取所有分类
```bash
curl -X GET "${BASE_URL}/api/categories"
```

### 5.2 获取统计数据
```bash
curl -X GET "${BASE_URL}/api/statistics"
```

---

## 🔄 完整的上传到阅读流程脚本

```bash
#!/bin/bash

BASE_URL="http://localhost:3000"
FILE_PATH="./test-document.pdf"

echo "步骤1: 获取预签名上传 URL..."
RESPONSE=$(curl -s -X POST "${BASE_URL}/api/upload/presigned-url" \
  -H "Content-Type: application/json" \
  -d "{
    \"fileName\": \"$(basename $FILE_PATH)\",
    \"fileSize\": $(stat -f%z "$FILE_PATH" 2>/dev/null || stat -c%s "$FILE_PATH" 2>/dev/null),
    \"contentType\": \"application/pdf\"
  }")

echo "响应: $RESPONSE"

UPLOAD_URL=$(echo $RESPONSE | jq -r '.data.uploadUrl')
OSS_KEY=$(echo $RESPONSE | jq -r '.data.ossKey')

echo "步骤2: 上传文件到 OSS..."
curl -X PUT "${UPLOAD_URL}" \
  -H "Content-Type: application/pdf" \
  --data-binary "@${FILE_PATH}"

echo "步骤3: 确认上传，创建文献记录..."
curl -X POST "${BASE_URL}/api/upload/confirm" \
  -H "Content-Type: application/json" \
  -d "{
    \"ossKey\": \"${OSS_KEY}\",
    \"metadata\": {
      \"title\": \"莎士比亚戏剧研究\",
      \"author\": \"张三\",
      \"year\": 2024,
      \"description\": \"关于莎士比亚四大悲剧的研究论文\",
      \"category\": \"戏剧理论\"
    },
    \"fileInfo\": {
      \"fileSize\": $(stat -f%z "$FILE_PATH" 2>/dev/null || stat -c%s "$FILE_PATH" 2>/dev/null),
      \"fileName\": \"$(basename $FILE_PATH)\"
    }
  }"

echo "步骤4: 获取文献列表..."
curl -s -X GET "${BASE_URL}/api/literatures" | jq

echo "完成！"
```

---

## 🧪 快速测试脚本（使用现有文献）

```bash
#!/bin/bash

BASE_URL="http://localhost:3000"

echo "测试1: 获取文献列表"
curl -s "${BASE_URL}/api/literatures" | jq

echo -e "\n测试2: 获取文献详情"
LITERATURE_ID=$(curl -s "${BASE_URL}/api/literatures" | jq -r '.data.items[0].id')
curl -s "${BASE_URL}/api/literatures/${LITERATURE_ID}" | jq

echo -e "\n测试3: 获取阅读 URL"
curl -s "${BASE_URL}/api/literatures/${LITERATURE_ID}/read-url" | jq

echo -e "\n测试4: 获取下载 URL"
curl -s "${BASE_URL}/api/literatures/${LITERATURE_ID}/download-url" | jq

echo -e "\n测试5: 查看统计"
curl -s "${BASE_URL}/api/statistics" | jq
```

---

## 📝 错误处理示例

### 文件类型不支持
```bash
curl -X POST "${BASE_URL}/api/upload/presigned-url" \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "test.exe",
    "fileSize": 1024,
    "contentType": "application/exe"
  }'
```

**响应：** 400 错误，提示文件类型不支持

### 文件过大
```bash
curl -X POST "${BASE_URL}/api/upload/presigned-url" \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "large.pdf",
    "fileSize": 999999999,
    "contentType": "application/pdf"
  }'
```

**响应：** 413 错误，提示文件过大

### 文献不存在
```bash
curl -X GET "${BASE_URL}/api/literatures/non-existent-id/read-url"
```

**响应：** 404 错误，文献不存在

---

## 💡 提示

1. **保存响应中的 ID**：后续操作需要使用文献 ID
2. **预签名 URL 有效期**：阅读和下载 URL 都是 1 小时有效
3. **公共 URL**：列表中的 `public` URL 是永久有效的（如果 Bucket 设置为公共读）
4. **使用 jq**：安装 `jq` 工具可以更美观地查看 JSON 响应
   ```bash
   # macOS
   brew install jq
   # Linux
   sudo apt-get install jq
   ```

5. **调试模式**：添加 `-v` 参数查看详细请求信息
   ```bash
   curl -v -X GET "${BASE_URL}/api/literatures"
   ```
