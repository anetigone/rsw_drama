/**
 * 问卷分析服务
 * 负责调用大模型 API 进行问卷分析
 */

interface QuestionnaireAnswer {
  dimensionScores: Array<{
    dimension: string;
    score: number;
    averageScore: number;
  }>;
  totalScore: number;
  answers?: Array<{
    questionId: number;
    score: number;
  }>;
}

interface AnalysisRequest {
  answer: QuestionnaireAnswer;
  questionnaireType: 'psychological' | 'red_memory';
}

interface AnalysisResponse {
  success: boolean;
  analysis?: string;
  error?: string;
}

type StreamCallback = (chunk: string) => void;

/**
 * 大模型配置
 */
const LLM_CONFIG = {
  baseURL: process.env.LLM_BASE_URL || 'https://api.deepseek.com/v1',
  apiKey: process.env.LLM_API_KEY || '',
  model: process.env.LLM_MODEL || 'deepseek-chat',
  temperature: parseFloat(process.env.LLM_TEMPERATURE || '0.7'),
  maxTokens: parseInt(process.env.LLM_MAX_TOKENS || '4000')
};

/**
 * 问卷分析服务
 */
export class QuestionnaireService {
  /**
   * 非流式分析
   */
  async analyze(request: AnalysisRequest): Promise<AnalysisResponse> {
    try {
      const { answer, questionnaireType } = request;

      // 验证 API Key
      if (!LLM_CONFIG.apiKey) {
        return {
          success: false,
          error: '未配置 LLM API Key'
        };
      }

      // 构建提示词
      const prompt = this.buildAnalysisPrompt(answer, questionnaireType);

      // 调用 LLM API
      const response = await fetch(`${LLM_CONFIG.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${LLM_CONFIG.apiKey}`
        },
        body: JSON.stringify({
          model: LLM_CONFIG.model,
          messages: [
            {
              role: 'system',
              content: this.getSystemPrompt(questionnaireType)
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: LLM_CONFIG.temperature,
          max_tokens: LLM_CONFIG.maxTokens
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.choices && result.choices[0]) {
        return {
          success: true,
          analysis: result.choices[0].message.content
        };
      } else {
        return {
          success: false,
          error: 'LLM API 返回格式异常'
        };
      }
    } catch (error) {
      console.error('问卷分析服务错误:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '网络请求失败，请稍后重试'
      };
    }
  }

  /**
   * 流式分析
   */
  async analyzeStream(request: AnalysisRequest, onChunk: StreamCallback): Promise<AnalysisResponse> {
    try {
      const { answer, questionnaireType } = request;

      // 验证 API Key
      if (!LLM_CONFIG.apiKey) {
        return {
          success: false,
          error: '未配置 LLM API Key'
        };
      }

      // 构建提示词
      const prompt = this.buildAnalysisPrompt(answer, questionnaireType);

      // 调用 LLM API（流式）
      const response = await fetch(`${LLM_CONFIG.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${LLM_CONFIG.apiKey}`
        },
        body: JSON.stringify({
          model: LLM_CONFIG.model,
          messages: [
            {
              role: 'system',
              content: this.getSystemPrompt(questionnaireType)
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: LLM_CONFIG.temperature,
          max_tokens: LLM_CONFIG.maxTokens,
          stream: true // 开启流式输出
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      // 读取流式响应
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      if (!reader) {
        throw new Error('无法读取响应流');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6);
            if (dataStr === '[DONE]') continue;

            try {
              const data = JSON.parse(dataStr);
              const content = data.choices?.[0]?.delta?.content;
              if (content) {
                fullContent += content;
                onChunk(content); // 回调通知前端更新
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }

      return {
        success: true,
        analysis: fullContent
      };
    } catch (error) {
      console.error('问卷流式分析服务错误:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '网络请求失败，请稍后重试'
      };
    }
  }

  /**
   * 获取系统提示词
   */
  private getSystemPrompt(questionnaireType: string): string {
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
    } else if (questionnaireType === 'red_memory') {
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
    } else {
      throw new Error('不支持的问卷类型');
    }
  }

  /**
   * 构建分析提示词
   */
  private buildAnalysisPrompt(answer: QuestionnaireAnswer, questionnaireType: string): string {
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
}

export const questionnaireService = new QuestionnaireService();
