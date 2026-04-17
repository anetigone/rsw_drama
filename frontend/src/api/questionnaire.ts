/**
 * 问卷 API 接口
 * 调用后端 API 进行问卷分析
 * 支持流式和非流式输出
 */

import type {
  QuestionnaireAnalysisRequest,
  QuestionnaireAnalysisResponse
} from '../types/questionnaireTypes'

// 后端 API 地址（从环境变量读取）
const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3000/api'

/**
 * 流式回调函数类型
 */
export type StreamCallback = (chunk: string) => void

/**
 * 调用后端 API 分析问卷结果（非流式）
 * @param data 问卷分析请求数据
 * @returns 分析结果
 */
async function analyzeQuestionnaireBackend(
  data: QuestionnaireAnalysisRequest
): Promise<QuestionnaireAnalysisResponse> {
  try {
    const response = await fetch(`${BACKEND_API_URL}/questionnaire/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        questionnaireType: data.questionnaireType,
        answer: data.answer
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()

    if (result.success) {
      return {
        success: true,
        analysis: result.analysis
      }
    } else {
      return {
        success: false,
        error: result.error || '分析失败'
      }
    }
  } catch (error) {
    console.error('后端 API 调用失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '网络请求失败，请稍后重试'
    }
  }
}

/**
 * 调用后端 API 流式分析问卷结果
 * @param data 问卷分析请求数据
 * @param onChunk 接收流式数据的回调函数
 * @returns 完整的分析结果
 */
async function analyzeQuestionnaireBackendStream(
  data: QuestionnaireAnalysisRequest,
  onChunk: StreamCallback
): Promise<QuestionnaireAnalysisResponse> {
  try {
    const response = await fetch(`${BACKEND_API_URL}/questionnaire/analyze/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        questionnaireType: data.questionnaireType,
        answer: data.answer
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
    }

    // 读取流式响应
    const reader = response.body?.getReader()
    const decoder = new TextDecoder()
    let fullContent = ''

    if (!reader) {
      throw new Error('无法读取响应流')
    }

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataStr = line.slice(6).trim()
          if (dataStr === '[DONE]') continue

          try {
            const data = JSON.parse(dataStr)
            if (data.chunk) {
              fullContent += data.chunk
              onChunk(data.chunk) // 回调通知前端更新
            } else if (data.error) {
              throw new Error(data.error)
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
    }
  } catch (error) {
    console.error('后端 API 流式调用失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '网络请求失败，请稍后重试'
    }
  }
}

/**
 * 分析问卷结果（统一入口，非流式）
 * @param data 问卷分析请求数据
 * @returns 分析结果
 */
export async function analyzeQuestionnaire(
  data: QuestionnaireAnalysisRequest
): Promise<QuestionnaireAnalysisResponse> {
  console.log('🔧 调用后端 API 进行问卷分析')
  return analyzeQuestionnaireBackend(data)
}

/**
 * 分析问卷结果（流式版本）
 * @param data 问卷分析请求数据
 * @param onChunk 接收流式数据的回调函数
 * @returns 完整的分析结果
 */
export async function analyzeQuestionnaireStream(
  data: QuestionnaireAnalysisRequest,
  onChunk: StreamCallback
): Promise<QuestionnaireAnalysisResponse> {
  console.log('🔧 调用后端 API 进行问卷分析（流式）')
  return analyzeQuestionnaireBackendStream(data, onChunk)
}

/**
 * 问卷 API 对象
 */
export const questionnaireApi = {
  analyze: analyzeQuestionnaire
}
