/**
 * 问卷相关类型定义
 */

// 问卷类型
export const QuestionnaireType = {
  PSYCHOLOGICAL: 'psychological', // 心理疗愈效果评估
  RED_MEMORY: 'red_memory' // 红色记忆影响力评估
} as const

export type QuestionnaireType = (typeof QuestionnaireType)[keyof typeof QuestionnaireType]

// 问卷题目接口
export interface Question {
  id: number
  dimension: string // 维度名称
  content: string // 题目内容
  score?: number // 用户评分 (1-5)
}

// 问卷维度接口
export interface QuestionnaireDimension {
  name: string // 维度名称
  questions: Question[] // 该维度的题目
}

// 完整问卷接口
export interface Questionnaire {
  type: QuestionnaireType
  title: string // 问卷标题
  description: string // 问卷说明
  dimensions: QuestionnaireDimension[] // 各维度题目
}

// 问卷回答接口
export interface QuestionnaireAnswer {
  questionnaireType: QuestionnaireType
  dimensionScores: {
    dimension: string
    score: number // 维度总分
    averageScore: number // 维度平均分
  }[]
  totalScore: number // 总分
  answers: {
    questionId: number
    score: number
  }[]
}

// 问卷分析请求接口
export interface QuestionnaireAnalysisRequest {
  answer: QuestionnaireAnswer
  questionnaireType: QuestionnaireType
  metadata?: QuestionnaireMetadata
  llmConfig?: LLMConfig
}

// 问卷元数据接口
export interface QuestionnaireMetadata {
  sampleCount?: number
  ageDistribution?: string
  participationType?: string
  [key: string]: any
}

// LLM配置接口
export interface LLMConfig {
  apiKey?: string
  baseURL?: string
  model?: string
  temperature?: number
  maxTokens?: number
}

// 问卷分析响应接口
export interface QuestionnaireAnalysisResponse {
  success: boolean
  analysis?: string
  error?: string
}

// 心理疗愈问卷题目定义
export const PSYCHOLOGICAL_QUESTIONNAIRE: Questionnaire = {
  type: QuestionnaireType.PSYCHOLOGICAL as any,
  title: '戏剧心理疗愈效果评估问卷',
  description: '本问卷旨在评估戏剧体验对个人心理疗愈的影响，共20题，分为4个维度（情绪调节、自我接纳、压力缓解、人际联结），每题采用1-5分计分（1=完全不符合，2=不太符合，3=一般，4=比较符合，5=完全符合），最终根据各维度分值及总分，分析心理疗愈效果。请根据自身真实体验如实填写，答案无对错之分。',
  dimensions: [
    {
      name: '情绪调节维度',
      questions: [
        { id: 1, dimension: '情绪调节维度', content: '观看/参与本戏剧后，我能更快平复负面情绪（如焦虑、烦躁、低落）。' },
        { id: 2, dimension: '情绪调节维度', content: '戏剧中的情节或角色，能让我感受到情绪的共鸣，释放内心积压的情绪。' },
        { id: 3, dimension: '情绪调节维度', content: '体验戏剧后，我对自身情绪的感知更清晰，能更好地识别自己的情绪状态。' },
        { id: 4, dimension: '情绪调节维度', content: '当我感到情绪低落时，回忆戏剧中的相关片段，能让我逐渐找回积极心态。' },
        { id: 5, dimension: '情绪调节维度', content: '戏剧体验帮助我学会了更温和地对待自己的负面情绪，不再过度压抑。' }
      ]
    },
    {
      name: '自我接纳维度',
      questions: [
        { id: 6, dimension: '自我接纳维度', content: '通过戏剧中的角色映射，我能更客观地看待自己的优点与不足。' },
        { id: 7, dimension: '自我接纳维度', content: '体验戏剧后，我对自己的接纳度提高，不再过度苛责自己的不完美。' },
        { id: 8, dimension: '自我接纳维度', content: '戏剧传递的理念，让我学会了尊重自己的内心感受，不盲目迎合他人。' },
        { id: 9, dimension: '自我接纳维度', content: '我能从戏剧角色的成长中获得启发，更有勇气面对自己的短板。' },
        { id: 10, dimension: '自我接纳维度', content: '体验戏剧后，我感受到了自身的价值，减少了自我否定的想法。' }
      ]
    },
    {
      name: '压力缓解维度',
      questions: [
        { id: 11, dimension: '压力缓解维度', content: '观看/参与戏剧的过程中，我能暂时忘记生活中的压力和烦恼，获得放松。' },
        { id: 12, dimension: '压力缓解维度', content: '戏剧体验后，我能以更轻松的心态面对生活中的困难和挑战。' },
        { id: 13, dimension: '压力缓解维度', content: '参与戏剧相关活动（如排练、互动），能有效缓解我的精神紧张状态。' },
        { id: 14, dimension: '压力缓解维度', content: '戏剧中的轻松片段或积极导向，能让我感受到愉悦，缓解心理压力。' },
        { id: 15, dimension: '压力缓解维度', content: '体验戏剧后，我能更好地平衡压力与生活，减少焦虑感。' }
      ]
    },
    {
      name: '人际联结维度',
      questions: [
        { id: 16, dimension: '人际联结维度', content: '戏剧中的人际关系描写，让我更理解他人的处境，学会换位思考。' },
        { id: 17, dimension: '人际联结维度', content: '参与戏剧排练或分享，让我感受到了集体的温暖，减少了孤独感。' },
        { id: 18, dimension: '人际联结维度', content: '体验戏剧后，我更愿意与他人交流自己的内心感受，拉近了与他人的距离。' },
        { id: 19, dimension: '人际联结维度', content: '戏剧传递的互助、包容理念，让我更懂得如何与他人建立良好的联结。' },
        { id: 20, dimension: '人际联结维度', content: '通过讨论戏剧内容，我与他人产生了共同话题，增进了彼此的理解。' }
      ]
    }
  ]
}

// 红色记忆影响力问卷题目定义
export const RED_MEMORY_QUESTIONNAIRE: Questionnaire = {
  type: QuestionnaireType.RED_MEMORY as any,
  title: '戏剧红色记忆影响力评估问卷',
  description: '本问卷旨在评估戏剧对红色记忆的传递、唤醒及影响力效果，共20题，分为4个维度（记忆唤醒、情感共鸣、价值认同、行为倾向），每题采用1-5分计分（1=完全不符合，2=不太符合，3=一般，4=比较符合，5=完全符合），最终根据各维度分值及总分，分析红色记忆的影响力。请根据自身真实体验如实填写，答案无对错之分。',
  dimensions: [
    {
      name: '记忆唤醒维度',
      questions: [
        { id: 1, dimension: '记忆唤醒维度', content: '戏剧中的红色元素（如历史事件、英雄人物、红色精神），唤醒了我对相关红色记忆的认知。' },
        { id: 2, dimension: '记忆唤醒维度', content: '通过戏剧，我记住了更多之前不了解的红色历史细节或英雄事迹。' },
        { id: 3, dimension: '记忆唤醒维度', content: '戏剧的情节设计，让我对红色历史的时间线、事件背景有了更清晰的记忆。' },
        { id: 4, dimension: '记忆唤醒维度', content: '戏剧中的经典台词、场景，能让我快速联想到相关的红色历史内容。' },
        { id: 5, dimension: '记忆唤醒维度', content: '体验戏剧后，我会主动回忆或查阅相关的红色历史资料，加深记忆。' }
      ]
    },
    {
      name: '情感共鸣维度',
      questions: [
        { id: 6, dimension: '情感共鸣维度', content: '戏剧中英雄人物的事迹，让我感受到强烈的感动与敬佩之情。' },
        { id: 7, dimension: '情感共鸣维度', content: '观看/参与戏剧时，我能体会到红色历史中先辈们的艰辛与坚守，产生情感共鸣。' },
        { id: 8, dimension: '情感共鸣维度', content: '戏剧传递的红色精神（如爱国、奉献、坚韧），让我内心充满力量。' },
        { id: 9, dimension: '情感共鸣维度', content: '当戏剧呈现红色历史中的艰难时刻时，我能感受到内心的震撼。' },
        { id: 10, dimension: '情感共鸣维度', content: '体验戏剧后，我对红色历史中的先辈们产生了更深的敬畏之心。' }
      ]
    },
    {
      name: '价值认同维度',
      questions: [
        { id: 11, dimension: '价值认同维度', content: '我认同戏剧所传递的红色精神（如爱国情怀、集体主义、艰苦奋斗），并愿意践行。' },
        { id: 12, dimension: '价值认同维度', content: '通过戏剧，我更深刻地理解了红色精神的时代价值和现实意义。' },
        { id: 13, dimension: '价值认同维度', content: '戏剧让我认识到，红色记忆是民族宝贵的精神财富，需要传承和弘扬。' },
        { id: 14, dimension: '价值认同维度', content: '我认为戏剧是传递红色记忆、弘扬红色精神的有效方式。' },
        { id: 15, dimension: '价值认同维度', content: '体验戏剧后，我对"爱国""奉献"等价值观有了更深刻的认同。' }
      ]
    },
    {
      name: '行为倾向维度',
      questions: [
        { id: 16, dimension: '行为倾向维度', content: '体验戏剧后，我愿意向身边的人分享戏剧中的红色故事和红色精神。' },
        { id: 17, dimension: '行为倾向维度', content: '我会主动参与其他红色主题的活动（如红色展览、红色观影），深化红色记忆。' },
        { id: 18, dimension: '行为倾向维度', content: '我会尝试将戏剧传递的红色精神融入到日常学习和生活中。' },
        { id: 19, dimension: '行为倾向维度', content: '我愿意推荐他人观看/参与本戏剧，感受红色记忆的魅力。' },
        { id: 20, dimension: '行为倾向维度', content: '体验戏剧后，我更有动力去学习红色历史，传承红色基因。' }
      ]
    }
  ]
}

// 获取问卷配置
export function getQuestionnaireByType(type: QuestionnaireType): Questionnaire {
  switch (type) {
    case QuestionnaireType.PSYCHOLOGICAL:
      return PSYCHOLOGICAL_QUESTIONNAIRE
    case QuestionnaireType.RED_MEMORY:
      return RED_MEMORY_QUESTIONNAIRE
    default:
      const exhaustiveCheck: never = type
      throw new Error(`Unknown questionnaire type: ${exhaustiveCheck}`)
  }
}
