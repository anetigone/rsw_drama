# 问卷分析云函数部署指南

这个云函数用于分析戏剧项目问卷结果，通过调用大语言模型（LLM）生成深度分析报告。

## 功能特性

- 接收两种问卷的答案数据：
  - 戏剧心理疗愈效果评估问卷
  - 戏剧红色记忆影响力评估问卷
- 调用大模型（Claude/GPT/通义千问等）进行分析
- 返回结构化的分析报告，包括：
  - 评分综述
  - 各维度详细分析
  - 核心发现
  - 改进建议
  - 结论

## 支持的云平台

- 腾讯云云函数（SCF）
- 阿里云函数计算（FC）
- AWS Lambda
- 其他支持 Node.js 的 Serverless 平台

## 环境变量配置

在部署云函数时，需要配置以下环境变量（根据使用的模型选择）：

### 使用 Claude API
```
CLAUDE_API_KEY=your-claude-api-key-here
```

### 使用 OpenAI GPT
```
OPENAI_API_KEY=your-openai-api-key-here
```

### 使用阿里通义千问
```
QIANWEN_API_KEY=your-qianwen-api-key-here
```

## 部署步骤

### 腾讯云 SCF 部署

1. 登录腾讯云控制台，进入云函数服务
2. 点击"新建"，选择"从头开始"
3. 填写函数信息：
   - 函数名称：`questionnaire-analysis`
   - 运行环境：Node.js 16.x 或更高版本
   - 函数代码：在线编辑
4. 将 `index.js` 的内容复制到编辑器
5. 配置环境变量（添加 API Key）
6. 点击"完成"创建函数
7. 在触发管理中，创建 API 触发器：
   - 请求方法：POST
   - 路径：`/questionnaire-analysis`
   - 鉴权：根据需要选择

### 阿里云 FC 部署

1. 登录阿里云控制台，进入函数计算服务
2. 点击"创建函数"，选择"使用内置运行时创建"
3. 填写函数信息：
   - 函数名称：`questionnaire-analysis`
   - 运行环境：Node.js 16 或更高版本
   - 代码上传方式：使用示例代码
4. 将 `index.js` 的内容替换示例代码
5. 在配置页面的环境变量中添加 API Key
6. 配置 HTTP 触发器：
   - 请求方法：POST
   - 路径：`/questionnaire-analysis`
   - 鉴权方式：根据需要选择

### AWS Lambda 部署

1. 登录 AWS 控制台，进入 Lambda 服务
2. 点击"Create function"
3. 选择"Author from scratch"
4. 填写基本信息：
   - Function name：`questionnaire-analysis`
   - Runtime：Node.js 16.x 或更高
5. 在代码编辑器中粘贴 `index.js` 内容
6. 在 Configuration > Environment variables 中添加 API Key
7. 配置 API Gateway 作为触发器

## 前端调用示例

前端通过以下方式调用云函数：

```typescript
import { questionnaireApi } from '@/api/questionnaire'

// 构建问卷答案数据
const answer = {
  questionnaireType: 'psychological',
  dimensionScores: [
    { dimension: '情绪调节维度', score: 22, averageScore: 4.4 },
    { dimension: '自我接纳维度', score: 20, averageScore: 4.0 },
    { dimension: '压力缓解维度', score: 18, averageScore: 3.6 },
    { dimension: '人际联结维度', score: 19, averageScore: 3.8 }
  ],
  totalScore: 79,
  answers: [
    { questionId: 1, score: 5 },
    { questionId: 2, score: 4 },
    // ... 更多答案
  ]
}

// 调用云函数进行分析
const response = await questionnaireApi.analyze({
  answer,
  questionnaireType: 'psychological'
})

if (response.success && response.analysis) {
  console.log('分析结果:', response.analysis)
}
```

## API 接口格式

### 请求

**URL:** `POST /questionnaire-analysis`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "answer": {
    "questionnaireType": "psychological",
    "dimensionScores": [
      {
        "dimension": "情绪调节维度",
        "score": 22,
        "averageScore": 4.4
      }
    ],
    "totalScore": 79,
    "answers": [
      {
        "questionId": 1,
        "score": 5
      }
    ]
  },
  "questionnaireType": "psychological"
}
```

### 响应

**成功响应 (200 OK):**
```json
{
  "success": true,
  "analysis": "## 📊 评分综述\n\n..."
}
```

**错误响应 (400/500):**
```json
{
  "success": false,
  "error": "错误信息描述"
}
```

## 费用说明

云函数费用主要来自：
1. **调用次数**：每次问卷分析计为一次调用
2. **计算时间**：模型 API 调用时间（通常 5-15 秒）
3. **出网流量**：返回分析结果产生的流量
4. **LLM API 费用**：根据使用的模型和 token 数量计费

建议根据实际使用情况选择合适的云函数套餐和模型配置。

## 监控和日志

- 在云函数控制台可以查看调用日志
- 监控关键指标：调用次数、成功率、平均执行时间、错误率
- 建议设置告警规则，当错误率超过阈值时及时通知

## 安全建议

1. **API Key 保护**
   - 使用环境变量存储 API Key
   - 不要将 API Key 硬编码在代码中
   - 定期轮换 API Key

2. **访问控制**
   - 配置 API 鉴权机制
   - 限制调用频率，防止滥用
   - 记录调用日志，便于审计

3. **数据安全**
   - 确保数据传输使用 HTTPS
   - 考虑对敏感数据进行加密

## 故障排查

### 常见问题

**Q: 云函数返回 500 错误**
A: 检查环境变量是否正确配置，查看云函数日志获取详细错误信息

**Q: API 调用超时**
A: 云函数超时时间建议设置为 30 秒以上，因为 LLM API 调用可能需要较长时间

**Q: 分析结果质量不佳**
A: 可以调整 prompt 中的提示词，或尝试使用不同的模型

## 扩展功能

可以考虑添加的功能：
1. 结果缓存：相同问卷答案在一定时间内不重复调用 API
2. 异步处理：对于大量问卷，使用队列异步处理
3. 数据存储：将分析结果保存到数据库，便于后续分析
4. 批量分析：支持一次性分析多个问卷结果

## 更新日志

- v1.0.0 (2025-04-16): 初始版本，支持两种问卷的分析
