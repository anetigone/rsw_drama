const axios = require('axios');

/**
 * 云函数：LLM问卷分析（支持流式输出）
 * 功能：调用LLM API分析问卷结果，生成专业分析报告
 * 入口：index.handler
 * 环境：Node.js 18
 */

/**
 * 云函数入口处理器（支持流式和非流式两种模式）
 * @param {Object} event - 云函数触发事件
 * @param {Object} context - 函数计算上下文
 * @returns {Promise<Object>} 返回处理结果或流式响应
 */
exports.handler = async (event) => {
  // 从 event 中获取参数
  let args;

  // 处理不同类型的 event
  if (Buffer.isBuffer(event)) {
    // 如果 event 是 Buffer，先转换为字符串再解析
    args = JSON.parse(event.toString());
  } else if (typeof event === 'string') {
    // 如果 event 是字符串，直接解析
    args = JSON.parse(event);
  } else if (event && typeof event.body === 'string') {
    // 如果 event.body 是字符串，解析它
    args = JSON.parse(event.body);
  } else if (event && event.body) {
    // 如果 event.body 是对象，直接使用
    args = event.body;
  } else {
    // 否则直接使用 event
    args = event;
  }

  // 验证必要参数
  if (!args.questionnaireType || !args.answers) {
    throw new Error('缺少必要参数：questionnaireType 和 answers');
  }

  // 检查是否启用流式输出（通过参数或环境变量控制）
  const enableStream = args.stream === true || process.env.ENABLE_STREAM === 'true';

  try {
    // 根据问卷类型选择对应的提示词
    const systemPrompt = getSystemPrompt(args.questionnaireType);

    // 构建用户输入
    const userContent = buildUserContent(args);

    // 调用LLM API（配置从云函数环境变量读取）
    if (enableStream) {
      // 流式输出模式
      return await streamLLMAPI(systemPrompt, userContent);
    } else {
      // 普通模式
      const analysisResult = await callLLMAPI(systemPrompt, userContent);

      return {
        success: true,
        analysis: analysisResult,
        questionnaireType: args.questionnaireType
      };
    }

  } catch (error) {
    console.error('LLM分析失败:', error);
    return {
      success: false,
      error: error.message || 'LLM分析失败',
      questionnaireType: args.questionnaireType
    };
  }
};

/**
 * 获取系统提示词
 */
function getSystemPrompt(questionnaireType) {
  if (questionnaireType === 'psychological') {
    return `### 角色定位
你是专注于戏剧心理疗愈领域的专业分析师，具备丰富的心理评估数据解读经验，熟悉问卷维度分析逻辑，能够结合戏剧大创项目的核心需求，对心理疗愈问卷结果进行全面、细致、有针对性的分析，为项目算法改进提供可落地的参考建议。

### 职责
1. 全面解读输入的问卷结果数据，明确问卷4个核心维度（情绪调节、自我接纳、压力缓解、人际联结）的得分分布情况，计算各维度平均分、总分平均分，标注高分维度与低分维度。
2. 分析各维度的表现特点：高分维度说明戏剧在该方面的心理疗愈效果突出，需总结具体优势；低分维度说明疗愈效果有待提升，需分析可能的原因（可结合戏剧呈现形式、内容设计等合理推测）。
3. 结合总分分布，判断整体心理疗愈效果等级（显著/较好/一般/不明显），总结整体表现亮点与核心不足。
4. 针对低分维度和整体不足，提出贴合戏剧大创项目的改进建议，建议需具体、可落地，适配后续心理疗愈功能算法的优化方向。
5. 输出分析报告，结构清晰、逻辑连贯，重点突出数据结论和改进建议，语言专业且通俗易懂，便于项目团队理解和应用。

### 额外要求
1. 分析需聚焦"戏剧对心理疗愈的实际影响"，避免脱离问卷数据和戏剧项目本身；
2. 重点关注各维度得分差异，为后续心理疗愈算法的优化提供明确方向；
3. 报告结尾可简要总结核心结论，方便项目团队快速抓取重点。`;
  }
  else if (questionnaireType === 'red_memory') {
    return `### 角色定位
你是红色文化传播与影响力评估领域的专业分析师，熟悉红色记忆相关内容，具备问卷数据解读和影响力分析能力，能够结合戏剧大创项目的红色元素呈现特点，对红色记忆影响力问卷结果进行深度分析，为项目红色记忆影响力算法改进提供精准支撑。

### 职责
1. 全面解析输入的问卷结果数据，明确问卷4个核心维度（记忆唤醒、情感共鸣、价值认同、行为倾向）的得分分布，计算各维度平均分、总分平均分，区分优势维度与薄弱维度。
2. 深入分析各维度表现：优势维度需总结戏剧在红色记忆传递中的有效方式（如角色塑造、情节设计等）；薄弱维度需分析红色记忆传递的不足，推测可能的原因（如红色元素呈现不够直观、情感传递不够深入等）。
3. 结合总分分布，判断红色记忆影响力的整体等级（显著/较好/一般/不明显），梳理整体传播亮点和待提升之处。
4. 针对薄弱维度，提出贴合戏剧大创项目的优化建议，建议需围绕红色元素呈现、红色精神传递等方面，适配后续红色记忆影响力算法的改进需求，确保可落地、有针对性。
5. 输出结构化分析报告，语言专业、逻辑清晰，重点突出数据结论、问题分析和改进建议，便于项目团队用于优化戏剧内容和算法设计。

### 额外要求
1. 分析需紧扣"戏剧传递红色记忆、弘扬红色精神"的核心目标，结合问卷数据客观分析影响力效果；
2. 重点挖掘各维度得分背后的深层原因，为红色记忆影响力算法的优化提供明确方向；
3. 报告需兼顾专业性和实用性，避免空泛表述，确保建议能够直接服务于项目推进。`;
  }
  else {
    throw new Error('不支持的问卷类型');
  }
}

/**
 * 构建用户输入内容
 */
function buildUserContent(args) {
  const { answers, questionnaireType, metadata = {} } = args;

  let content = `## 问卷结果数据\n\n`;

  // 添加元数据
  if (metadata.sampleCount) {
    content += `### 样本基本信息\n`;
    content += `- 填写人数：${metadata.sampleCount}\n`;
    if (metadata.ageDistribution) {
      content += `- 年龄分布：${metadata.ageDistribution}\n`;
    }
    if (metadata.participationType) {
      content += `- 参与方式：${metadata.participationType}\n`;
    }
    content += `\n`;
  }

  // 添加计分规则说明
  const dimensionNames = questionnaireType === 'psychological'
    ? ['情绪调节', '自我接纳', '压力缓解', '人际联结']
    : ['记忆唤醒', '情感共鸣', '价值认同', '行为倾向'];

  content += `### 计分规则\n`;
  content += `- 每题1-5分制（1=完全不符合，2=不太符合，3=一般，4=比较符合，5=完全符合）\n`;
  content += `- ${dimensionNames.join('、')}4个维度各5题，每维度满分25分\n`;
  content += `- 总分100分\n`;
  content += `- 80分及以上为效果显著，60-79分为较好，40-59分为一般，低于40分为不明显\n\n`;

  // 添加各维度得分数据
  content += `### 各维度得分详情\n\n`;

  if (answers.dimensionScores && Array.isArray(answers.dimensionScores)) {
    answers.dimensionScores.forEach((dimension, index) => {
      content += `#### ${dimension.dimension}\n`;
      content += `- 总分：${dimension.score}/25\n`;
      content += `- 平均分：${dimension.averageScore}/5\n`;
      content += `\n`;
    });
  }

  // 添加总分
  content += `### 总体得分\n`;
  content += `- 总分：${answers.totalScore}/100\n`;
  content += `- 总平均分：${(answers.totalScore / 20).toFixed(2)}/5\n\n`;

  // 添加详细回答（如果有）
  if (answers.detailedAnswers && Array.isArray(answers.detailedAnswers)) {
    content += `### 详细答题数据\n\n`;
    answers.detailedAnswers.forEach((answer, index) => {
      content += `#### 第${index + 1}份问卷\n`;
      answer.dimensionScores.forEach(dim => {
        content += `- ${dim.dimension}：${dim.score}/25\n`;
      });
      content += `- 总分：${answer.totalScore}/100\n\n`;
    });
  }

  return content;
}

/**
 * 调用LLM API（非流式）
 */
async function callLLMAPI(systemPrompt, userContent) {
  // 从云函数环境变量中读取配置
  const config = {
    apiKey: process.env.LLM_API_KEY,
    baseURL: process.env.LLM_BASE_URL || 'https://api.deepseek.com/v1',
    model: process.env.LLM_MODEL || 'deepseek-chat',
    temperature: parseFloat(process.env.LLM_TEMPERATURE || '0.7'),
    maxTokens: parseInt(process.env.LLM_MAX_TOKENS || '4000', 10)
  };

  if (!config.apiKey) {
    throw new Error('云函数环境变量中缺少LLM_API_KEY配置，请在云函数控制台设置环境变量');
  }

  const requestData = {
    model: config.model,
    messages: [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: userContent
      }
    ],
    temperature: config.temperature,
    max_tokens: config.maxTokens
  };

  try {
    const response = await axios.post(
      `${config.baseURL}/chat/completions`,
      requestData,
      {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000 // 60秒超时
      }
    );

    if (response.data && response.data.choices && response.data.choices[0]) {
      return response.data.choices[0].message.content;
    } else {
      throw new Error('LLM API返回格式异常');
    }
  } catch (error) {
    console.error('LLM API调用失败:', error.response?.data || error.message);
    throw new Error(`LLM API调用失败: ${error.message}`);
  }
}

/**
 * 调用LLM API（流式输出）
 * 使用Server-Sent Events (SSE)格式返回流式数据
 */
async function streamLLMAPI(systemPrompt, userContent) {
  // 从云函数环境变量中读取配置
  const config = {
    apiKey: process.env.LLM_API_KEY,
    baseURL: process.env.LLM_BASE_URL || 'https://api.deepseek.com/v1',
    model: process.env.LLM_MODEL || 'deepseek-chat',
    temperature: parseFloat(process.env.LLM_TEMPERATURE || '0.7'),
    maxTokens: parseInt(process.env.LLM_MAX_TOKENS || '4000', 10)
  };

  if (!config.apiKey) {
    throw new Error('云函数环境变量中缺少LLM_API_KEY配置，请在云函数控制台设置环境变量');
  }

  const requestData = {
    model: config.model,
    messages: [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: userContent
      }
    ],
    temperature: config.temperature,
    max_tokens: config.maxTokens,
    stream: true // 启用流式输出
  };

  try {
    const response = await axios.post(
      `${config.baseURL}/chat/completions`,
      requestData,
      {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 120000, // 120秒超时（流式可能需要更长时间）
        responseType: 'stream' // 接收流式响应
      }
    );

    // 返回流式响应
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no' // 禁用Nginx缓冲
      },
      body: response.data,
      isBase64Encoded: false
    };
  } catch (error) {
    console.error('LLM流式API调用失败:', error.response?.data || error.message);
    throw new Error(`LLM流式API调用失败: ${error.message}`);
  }
}