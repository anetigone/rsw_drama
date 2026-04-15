import type { TheoryContentResult } from '../types/theoryTypes'

/**
 * 加载理论内容
 * @param id 理论ID
 * @returns 理论内容加载结果
 */
export const loadTheoryContent = async (
  id: number
): Promise<TheoryContentResult> => {
  try {
    const response = await fetch(`/content/theory/theory_${id}.html`)

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP error! status: ${response.status}`
      }
    }

    const content = await response.text()

    return {
      success: true,
      content
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
