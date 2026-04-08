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
    id: 1,
    title: '《战友》',
    date: '1941年11月',
    description: '表现革命战士坚定信念和深厚友谊的经典剧作，展现了抗战时期革命者的精神风貌。',
    image: '/images/activities/1.jpg',
    contentPath: '/content/activities/activity_1.html'
  },
  {
    id: 2,
    title: '《回春之曲》',
    date: '1942年3月',
    description: '描写知识分子投身抗日救亡运动的感人故事，通过艺术形式传递爱国主义精神。',
    image: '/images/activities/2.jpg',
    contentPath: '/content/activities/activity_2.html'
  },
  {
    id: 3,
    title: '《放下你的鞭子》',
    date: '1940年8月',
    description: '抗战时期著名街头剧，由陈鲤庭根据田汉的独幕剧改编，激发了广大民众的爱国热情。',
    image: '/images/activities/3.jpg',
    contentPath: '/content/activities/activity_3.html'
  },
  {
    id: 4,
    title: '《屈原》',
    date: '1942年4月',
    description: '郭沫若的经典历史剧，借古讽今，表达了对国民党独裁统治的不满和对自由的向往。',
    image: '/images/activities/4.jpg',
    contentPath: '/content/activities/activity_4.html'
  },
  {
    id: 5,
    title: '《新·西南剧展》',
    date: '2026年3月',
    description: '一个以西南剧展为背景的剧展，展示了西南剧展的历史、文化、社会等。',
    image: '/images/activities/5.jpg',
    contentPath: '/content/activities/activity_5.html'
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
