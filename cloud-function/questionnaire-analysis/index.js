/**
 * 云函数：问卷分析
 * 功能：接收问卷答案，调用大模型进行分析
 * 部署平台：腾讯云 SCF / 阿里云 FC / AWS Lambda 等
 */

// 引入 HTTP 库（根据部署平台选择）
const http = require('https'); // 或使用 axios、fetch 等

/**
 * 云函数入口
 * @param {Object} event - 请求事件对象
 * @param {Object} context - 上下文对象
 * @returns {Object} 响应对象
 */
exports.main_handler = async (event, context) => {
  try {
    // 1. 解析请求参数
    let requestBody;

    // 根据不同的云平台，解析请求体
    if (event.body) {
      if (typeof event.body === 'string') {
        requestBody = JSON.parse(event.body);
      } else {
        requestBody = event.body;
      }
    } else {
      throw new Error('请求体为空');
    }

    const { answer, questionnaireType } = requestBody;

    // 2. 验证参数
    if (!answer || !questionnaireType) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: '缺少必要参数：answer 或 questionnaireType'
        })
      };
    }

    // 3. 构建分析提示词
    const prompt = buildAnalysisPrompt(answer, questionnaireType);

    // 4. 调用大模型 API
    const analysisResult = await callLLM(prompt);

    // 5. 返回结果
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        analysis: analysisResult
      })
    };

  } catch (error) {
    console.error('云函数执行错误:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: error.message || '服务器内部错误'
      })
    };
  }
};

/**
 * 构建分析提示词
 * @param {Object} answer - 问卷答案
 * @param {string} questionnaireType - 问卷类型
 * @returns {string} 提示词
 */
function buildAnalysisPrompt(answer, questionnaireType) {
  const { dimensionScores, totalScore } = answer;

  let questionnaireTitle = '';
  let evaluationCriteria = '';

  if (questionnaireType === 'psychological') {
    questionnaireTitle = '戏剧心理疗愈效果评估问卷';
    evaluationCriteria = `
评分标准：
- 总分≥80分：疗愈效果显著
- 总分60-79分：疗愈效果较好
- 总分40-59分：疗愈效果一般
- 总分<40分：疗愈效果不明显

维度分析：
- 情绪调节维度：评估戏剧对情绪管理的影响
- 自我接纳维度：评估戏剧对自我认知的影响
- 压力缓解维度：评估戏剧对压力管理的影响
- 人际联结维度：评估戏剧对人际关系的影响
`;
  } else if (questionnaireType === 'red_memory') {
    questionnaireTitle = '戏剧红色记忆影响力评估问卷';
    evaluationCriteria = `
评分标准：
- 总分≥80分：影响力显著
- 总分60-79分：影响力较好
- 总分40-59分：影响力一般
- 总分<40分：影响力不明显

维度分析：
- 记忆唤醒维度：评估戏剧对红色历史记忆的唤醒效果
- 情感共鸣维度：评估戏剧对情感共鸣的激发效果
- 价值认同维度：评估戏剧对红色价值观的传递效果
- 行为倾向维度：评估戏剧对行为意向的影响效果
`;
  }

  let dimensionsText = '';
  dimensionScores.forEach(dim => {
    dimensionsText += `${dim.dimension}：${dim.score}分（平均${dim.averageScore.toFixed(2)}分）\n`;
  });

  const prompt = `你是一位专业的心理学和戏剧教育研究专家。请对以下${questionnaireTitle}的结果进行深度分析。

${evaluationCriteria}

问卷得分情况：
-------------------------------------
${dimensionsText}
总分：${totalScore}/100分

请按照以下结构进行分析（使用Markdown格式）：

## 📊 评分综述
简要总结整体得分情况和总体评价。

## 🎯 各维度详细分析

### 维度一：${dimensionScores[0]?.dimension || '维度一'}
**得分：${dimensionScores[0]?.score || 0}分**
分析该维度的表现，包括：
- 得分含义解读
- 该维度的优势和亮点
- 存在的不足或改进空间

### 维度二：${dimensionScores[1]?.dimension || '维度二'}
**得分：${dimensionScores[1]?.score || 0}分**
（同上分析结构）

### 维度三：${dimensionScores[2]?.dimension || '维度三'}
**得分：${dimensionScores[2]?.score || 0}分**
（同上分析结构）

### 维度四：${dimensionScores[3]?.dimension || '维度四'}
**得分：${dimensionScores[3]?.score || 0}分**
（同上分析结构）

## 💡 核心发现
基于各维度得分，提炼出3-5个核心发现：
1. 戏剧在该方面表现突出的优势
2. 各维度之间的关联性
3. 值得关注的特殊模式或趋势

## 🚀 改进建议
针对发现的问题和不足，提供具体可行的改进建议：
- 针对低分维度的改进措施
- 优化戏剧内容和表现形式的具体建议
- 提升整体效果的策略

## 📝 结论
给出综合性结论和建议。

请使用专业但易懂的语言，确保分析既有理论深度又有实践指导意义。`;

  return prompt;
}

/**
 * 调用大模型 API
 * @param {string} prompt - 提示词
 * @returns {Promise<string>} 模型返回的分析结果
 */
async function callLLM(prompt) {
  return new Promise((resolve, reject) => {
    // 这里以调用 Anthropic Claude API 为例
    // 如果使用其他模型（如 OpenAI GPT、阿里通义千问等），请相应调整

    const apiKey = process.env.CLAUDE_API_KEY || 'your-api-key-here';
    const apiEndpoint = 'https://api.anthropic.com/v1/messages';

    const requestData = JSON.stringify({
      model: 'claude-3-5-sonnet-20241022', // 或其他可用模型
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(requestData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);

          if (response.content && response.content[0] && response.content[0].text) {
            resolve(response.content[0].text);
          } else {
            reject(new Error('API 响应格式异常'));
          }
        } catch (error) {
          reject(new Error(`解析 API 响应失败: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`API 请求失败: ${error.message}`));
    });

    req.write(requestData);
    req.end();
  });
}

/**
 * 备选方案：使用 OpenAI GPT
 */
async function callOpenAIGPT(prompt) {
  const axios = require('axios');
  const apiKey = process.env.OPENAI_API_KEY;

  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: '你是一位专业的心理学和戏剧教育研究专家。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 4096,
      temperature: 0.7
    },
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data.choices[0].message.content;
}

/**
 * 备选方案：使用阿里通义千问
 */
async function callQianWen(prompt) {
  const axios = require('axios');
  const apiKey = process.env.QIANWEN_API_KEY;

  const response = await axios.post(
    'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
    {
      model: 'qwen-max',
      input: {
        messages: [
          {
            role: 'system',
            content: '你是一位专业的心理学和戏剧教育研究专家。'
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      },
      parameters: {
        max_tokens: 4096,
        temperature: 0.7
      }
    },
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data.output.text;
}
