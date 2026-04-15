import type { Theory, TheoryDetail } from '../types/theoryTypes'
import { loadTheoryContent } from './theoryLoader'

// 重新导出Theory类型，以便其他文件使用
export type { Theory, TheoryDetail }

/**
 * 理论基础数据列表
 * 只包含理论的基本信息，不包含详细内容
 */
export const theories: Theory[] = [
  {
    id: 1,
    title: '抗战时期西南话剧谱系研究-成渝篇',
    date: '2026年4月14日',
    description: '本文梳理了抗战时期西南话剧的谱系，重点分析了成渝地区的话剧发展情况，探讨了话剧在抗战时期的文化传播和社会影响。',
    contentPath: '/content/theory/theory_1.html'
  }
]

/**
 * 获取所有理论列表
 * @returns 理论列表（不包含详细内容）
 */
export const getTheories = (): Theory[] => {
  return theories
}

/**
 * 根据ID获取理论基础信息
 * @param id 理论ID
 * @returns 理论基础信息或undefined
 */
export const getTheoryById = (id: number): Theory | undefined => {
  return theories.find(theory => theory.id === id)
}

/**
 * 根据ID获取理论详情（包含内容）
 * @param id 理论ID
 * @returns 理论详情或null
 */
export const getTheoryDetailById = async (id: number): Promise<TheoryDetail | null> => {
  const theory = getTheoryById(id)

  if (!theory) {
    return null
  }

  // 加载理论内容
  const contentResult = await loadTheoryContent(id)

  if (!contentResult.success) {
    console.warn(`无法加载理论内容: ${contentResult.error}`)
    // 如果加载失败，返回基础信息，内容为空
    return {
      ...theory,
      content: '<p>理论内容加载失败，请稍后重试。</p>'
    }
  }

  return {
    ...theory,
    content: contentResult.content || ''
  }
}
