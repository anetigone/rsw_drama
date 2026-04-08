/**
 * 活动数据类型定义
 * 包含活动相关的所有接口和类型定义
 */

/**
 * 活动基础信息接口
 * 用于活动列表展示
 */
export interface Activity {
  id: number
  title: string
  date: string
  description: string
  image?: string
  contentPath?: string // 活动内容HTML文件路径
}

/**
 * 活动详情接口
 * 包含完整的活动内容
 */
export interface ActivityDetail extends Activity {
  content: string // 完整的HTML内容
}

/**
 * 活动内容加载结果
 */
export interface ActivityContentResult {
  success: boolean
  content?: string
  error?: string
}

/**
 * 活动列表响应
 */
export interface ActivityListResponse {
  activities: Activity[]
  total: number
}
