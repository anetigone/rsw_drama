import type { Activity, ActivityContentResult } from '../types/activityTypes'

/**
 * 活动内容加载工具
 * 用于动态加载活动详情内容
 */

/**
 * 加载活动内容
 * @param activityId 活动ID
 * @returns 活动内容加载结果
 */
export async function loadActivityContent(activityId: number): Promise<ActivityContentResult> {
  try {
    const contentPath = `/content/activities/activity_${activityId}.html`
    
    const response = await fetch(contentPath)
    
    if (!response.ok) {
      if (response.status === 404) {
        return {
          success: false,
          error: '活动内容不存在'
        }
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const content = await response.text()
    
    return {
      success: true,
      content
    }
  } catch (error) {
    console.error('加载活动内容失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }
  }
}

/**
 * 预加载活动内容（可选，用于性能优化）
 * @param activities 活动列表
 */
export async function preloadActivityContents(activities: Activity[]): Promise<void> {
  const preloadPromises = activities.map(activity => 
    loadActivityContent(activity.id)
  )
  
  await Promise.all(preloadPromises)
}

/**
 * 检查活动内容是否存在
 * @param activityId 活动ID
 * @returns 是否存在
 */
export async function checkActivityContentExists(activityId: number): Promise<boolean> {
  const result = await loadActivityContent(activityId)
  return result.success
}
