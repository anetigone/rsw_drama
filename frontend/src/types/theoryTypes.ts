/**
 * 理论研究数据类型定义
 * 包含理论研究相关的所有接口和类型定义
 */

/**
 * 理论基础信息接口
 * 用于理论研究列表展示
 */
export interface Theory {
  id: number
  title: string
  date: string
  description: string
  contentPath?: string // 理论内容HTML文件路径
}

/**
 * 理论详情接口
 * 包含完整的理论内容
 */
export interface TheoryDetail extends Theory {
  content: string // 完整的HTML内容
}

/**
 * 理论内容加载结果
 */
export interface TheoryContentResult {
  success: boolean
  content?: string
  error?: string
}

/**
 * 理论列表响应
 */
export interface TheoryListResponse {
  theories: Theory[]
  total: number
}
