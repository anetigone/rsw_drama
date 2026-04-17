/**
 * LLM API 配置
 * 支持本地测试和云函数调用两种模式
 */

// LLM 配置接口
export interface LLMConfig {
  apiKey: string
  baseURL?: string
  model?: string
  temperature?: number
  maxTokens?: number
}

// 获取 LLM 配置（优先从环境变量读取）
export function getLLMConfig(): LLMConfig | null {
  const apiKey = import.meta.env.VITE_LLM_API_KEY

  if (!apiKey) {
    return null
  }

  return {
    apiKey,
    baseURL: import.meta.env.VITE_LLM_BASE_URL || 'https://api.deepseek.com/v1',
    model: import.meta.env.VITE_LLM_MODEL || 'deepseek-chat',
    temperature: parseFloat(import.meta.env.VITE_LLM_TEMPERATURE || '0.7'),
    maxTokens: parseInt(import.meta.env.VITE_LLM_MAX_TOKENS || '4000', 10)
  }
}

// 检查是否启用了本地测试模式
export function isLocalTestMode(): boolean {
  return import.meta.env.VITE_ENABLE_LOCAL_LLM === 'true'
}

// 默认 LLM 配置（用于测试）
export const DEFAULT_LLM_CONFIG: LLMConfig = {
  apiKey: '', // 需要在 .env 中配置
  baseURL: 'https://api.deepseek.com/v1',
  model: 'deepseek-chat',
  temperature: 0.7,
  maxTokens: 4000
}
