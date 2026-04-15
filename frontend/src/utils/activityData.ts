import type { Activity, ActivityDetail } from '../types/activityTypes'
import { loadActivityContent } from './activityLoader'

// 重新导出Activity类型，以便其他文件使用
export type { Activity, ActivityDetail }

/**
 * 活动基础数据列表
 * 只包含活动的基本信息，不包含详细内容
 */
export const activities: Activity[] = [
  {
    id: 5,
    title: '《新·西南剧展》进社区，新大众文艺实践活动在互鉴书院圆满举行',
    date: '2026年3月29日',
    description: '由四川大学文化产业研究中心指导，近都社区主办，互鉴书院承办的“青瓦・博士进社区”文化推广系列活动之“当好剧中人、做好剧作者、唱好中国戏”主题活动圆满落幕。',
    image: '/images/activities/activity_5/1775649755132_25.jpg',
    contentPath: '/content/activities/activity_5.html'
  },
  {
    id: 6,
    title: '《新·西南剧展》话剧演出在文新演播厅顺利开展',
    date: '2026年4月11日',
    description: '2026年4月11日晚18:30，由四川大学哲学系、四川大学文学与新闻学院、四川大学雷雨话剧社联合出品的西南抗战话剧《新·西南剧展》，于四川大学江安校区文新演播厅圆满落幕。',
    image: '/images/activities/activity_6/1776213033474_728.jpg',
    contentPath: '/content/activities/activity_6.html'
  }
]

/**
 * 获取所有活动列表
 * @returns 活动列表（不包含详细内容）
 */
export const getActivities = (): Activity[] => {
  return activities
}

/**
 * 根据ID获取活动基础信息
 * @param id 活动ID
 * @returns 活动基础信息或undefined
 */
export const getActivityById = (id: number): Activity | undefined => {
  return activities.find(activity => activity.id === id)
}

/**
 * 根据ID获取活动详情（包含内容）
 * @param id 活动ID
 * @returns 活动详情或null
 */
export const getActivityDetailById = async (id: number): Promise<ActivityDetail | null> => {
  const activity = getActivityById(id)
  
  if (!activity) {
    return null
  }
  
  // 加载活动内容
  const contentResult = await loadActivityContent(id)
  
  if (!contentResult.success) {
    console.warn(`无法加载活动内容: ${contentResult.error}`)
    // 如果加载失败，返回基础信息，内容为空
    return {
      ...activity,
      content: '<p>活动内容加载失败，请稍后重试。</p>'
    }
  }
  
  return {
    ...activity,
    content: contentResult.content || ''
  }
}
