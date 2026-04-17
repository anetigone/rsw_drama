<template>
  <div class="questionnaire-view">
    <el-container class="container">
      <el-header class="header">
        <h1>{{ questionnaire.title }}</h1>
        <p class="description">{{ questionnaire.description }}</p>
      </el-header>

      <el-main class="main-content">
        <!-- 进度条 -->
        <div class="progress-bar">
          <el-progress
            :percentage="progressPercentage"
            :format="() => `${answeredCount}/${totalQuestions}`"
          />
        </div>

        <!-- 问卷表单 -->
        <el-form
          ref="formRef"
          :model="formData"
          label-position="top"
          class="questionnaire-form"
        >
          <!-- 按维度分组显示题目 -->
          <div
            v-for="(dimension, dimIndex) in questionnaire.dimensions"
            :key="dimIndex"
            class="dimension-section"
          >
            <h2 class="dimension-title">{{ dimension.name }}</h2>

            <div
              v-for="question in dimension.questions"
              :key="question.id"
              class="question-item"
            >
              <div class="question-header">
                <span class="question-number">{{ question.id }}</span>
                <span class="question-content">{{ question.content }}</span>
              </div>

              <el-radio-group
                v-model="formData.answers[question.id]"
                class="rating-group"
                @change="handleAnswerChange(question.id)"
              >
                <el-radio
                  v-for="score in [1, 2, 3, 4, 5]"
                  :key="score"
                  :label="score"
                  class="rating-option"
                >
                  {{ getScoreLabel(score) }}
                </el-radio>
              </el-radio-group>
            </div>
          </div>
        </el-form>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <el-button @click="handleReset">重置</el-button>
          <el-button
            type="primary"
            :disabled="!isAllAnswered"
            :loading="analyzing"
            @click="handleSubmit"
          >
            提交并分析
          </el-button>
        </div>
      </el-main>
    </el-container>

    <!-- 分析结果对话框 -->
    <el-dialog
      v-model="showAnalysisDialog"
      title="问卷分析结果"
      width="70%"
      :close-on-click-modal="false"
    >
      <div v-if="analysisResult" class="analysis-content">
        <div class="analysis-section">
          <h3>评分统计</h3>
          <el-table :data="scoreTableData" border>
            <el-table-column prop="dimension" label="维度" width="180" />
            <el-table-column prop="score" label="总分" width="100" />
            <el-table-column prop="averageScore" label="平均分" width="100" />
            <el-table-column prop="level" label="评价" />
          </el-table>
          <div class="total-score">
            <strong>总分: {{ totalScore }}/100</strong>
            <el-tag
              :type="getTotalScoreType(totalScore)"
              style="margin-left: 10px"
            >
              {{ getTotalScoreLevel(totalScore) }}
            </el-tag>
          </div>
        </div>

        <div class="analysis-section">
          <h3>AI 分析</h3>
          <div class="ai-analysis" v-html="formattedAnalysis"></div>
        </div>
      </div>
      <div v-else-if="analysisError" class="error-message">
        <el-alert
          :title="'分析失败'"
          :description="analysisError"
          type="error"
          :closable="false"
        />
      </div>
      <div v-else class="loading-message">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>正在分析中，请稍候...</span>
      </div>

      <template #footer>
        <el-button @click="showAnalysisDialog = false">关闭</el-button>
        <el-button
          v-if="analysisResult"
          type="primary"
          @click="handleExportResult"
        >
          导出结果
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import {
  getQuestionnaireByType,
  QuestionnaireType,
  type QuestionnaireAnswer,
  type Questionnaire
} from '../types/questionnaireTypes'
import { analyzeQuestionnaireStream } from '../api/questionnaire'

const route = useRoute()

// 问卷类型
const questionnaireType = ref<QuestionnaireType>(
  (route.query.type as QuestionnaireType) || QuestionnaireType.PSYCHOLOGICAL
)

// 问卷配置
const questionnaire = ref<Questionnaire>(
  getQuestionnaireByType(questionnaireType.value)
)

// 表单数据
const formData = ref<{
  answers: Record<number, number>
}>({
  answers: {}
})

// 分析状态
const analyzing = ref(false)
const showAnalysisDialog = ref(false)
const analysisResult = ref<string>('')
const analysisError = ref<string>('')
const isStreaming = ref(false) // 是否使用流式输出

// 计算属性
const totalQuestions = computed(() => {
  return questionnaire.value.dimensions.reduce(
    (sum, dim) => sum + dim.questions.length,
    0
  )
})

const answeredCount = computed(() => {
  return Object.keys(formData.value.answers).length
})

const progressPercentage = computed(() => {
  return (answeredCount.value / totalQuestions.value) * 100
})

const isAllAnswered = computed(() => {
  return answeredCount.value === totalQuestions.value
})

const totalScore = computed(() => {
  let sum = 0
  questionnaire.value.dimensions.forEach(dimension => {
    dimension.questions.forEach(question => {
      const score = formData.value.answers[question.id]
      if (score !== undefined) {
        sum += score
      }
    })
  })
  return sum
})

const scoreTableData = computed(() => {
  return questionnaire.value.dimensions.map(dimension => {
    let dimScore = 0
    dimension.questions.forEach(question => {
      const score = formData.value.answers[question.id]
      if (score !== undefined) {
        dimScore += score
      }
    })
    return {
      dimension: dimension.name,
      score: dimScore,
      averageScore: (dimScore / dimension.questions.length).toFixed(2),
      level: getDimensionLevel(dimScore)
    }
  })
})

const formattedAnalysis = computed(() => {
  if (!analysisResult.value) return ''
  return analysisResult.value
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
})

// 方法
const getScoreLabel = (score: number): string => {
  const labels = {
    1: '完全不符合',
    2: '不太符合',
    3: '一般',
    4: '比较符合',
    5: '完全符合'
  }
  return labels[score as keyof typeof labels]
}

const getDimensionLevel = (score: number): string => {
  if (score >= 20) return '效果显著'
  if (score >= 15) return '效果较好'
  if (score >= 10) return '效果一般'
  return '效果不明显'
}

const getTotalScoreLevel = (score: number): string => {
  if (score >= 80) return '效果显著'
  if (score >= 60) return '效果较好'
  if (score >= 40) return '效果一般'
  return '效果不明显'
}

const getTotalScoreType = (score: number) => {
  if (score >= 80) return 'success'
  if (score >= 60) return 'warning'
  if (score >= 40) return 'info'
  return 'danger'
}

const handleAnswerChange = (_questionId: number) => {
  // 当用户选择答案时触发
}

const handleReset = () => {
  ElMessageBox.confirm(
    '确定要重置所有答案吗？此操作不可恢复。',
    '确认重置',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      formData.value.answers = {}
      ElMessage.success('已重置所有答案')
    })
    .catch(() => {
      // 用户取消
    })
}

const handleSubmit = async () => {
  if (!isAllAnswered.value) {
    ElMessage.warning('请完成所有题目后再提交')
    return
  }

  analyzing.value = true
  showAnalysisDialog.value = true
  analysisResult.value = ''
  analysisError.value = ''
  isStreaming.value = true

  try {
    // 构建问卷答案对象
    const answer: QuestionnaireAnswer = {
      questionnaireType: questionnaireType.value,
      dimensionScores: [],
      totalScore: totalScore.value,
      answers: Object.entries(formData.value.answers).map(
        ([questionId, score]) => ({
          questionId: parseInt(questionId),
          score
        })
      )
    }

    // 计算各维度得分
    questionnaire.value.dimensions.forEach(dimension => {
      let dimScore = 0
      dimension.questions.forEach(question => {
        const score = formData.value.answers[question.id]
        if (score !== undefined) {
          dimScore += score
        }
      })
      answer.dimensionScores.push({
        dimension: dimension.name,
        score: dimScore,
        averageScore: dimScore / dimension.questions.length
      })
    })

    // 使用流式 API 进行分析
    const response = await analyzeQuestionnaireStream(
      {
        answer,
        questionnaireType: questionnaireType.value
      },
      // 流式回调函数
      (chunk: string) => {
        analysisResult.value += chunk
      }
    )

    if (response.success && response.analysis) {
      // 流式结束后，确保完整结果被设置
      if (!analysisResult.value) {
        analysisResult.value = response.analysis
      }
      ElMessage.success('分析完成')
    } else {
      analysisError.value = response.error || '分析失败，请稍后重试'
      ElMessage.error('分析失败')
    }
  } catch (error) {
    console.error('提交问卷失败:', error)
    analysisError.value = '网络请求失败，请稍后重试'
    ElMessage.error('提交失败')
  } finally {
    analyzing.value = false
    isStreaming.value = false
  }
}

const handleExportResult = () => {
  const resultText = `
${questionnaire.value.title}
=====================================

评分统计:
-------------------------------------
${scoreTableData.value
  .map(
    item =>
      `${item.dimension}: ${item.score}分 (平均${item.averageScore}分) - ${item.level}`
  )
  .join('\n')}

总分: ${totalScore.value}/100 - ${getTotalScoreLevel(totalScore.value)}

AI 分析:
-------------------------------------
${analysisResult.value}
  `.trim()

  // 创建下载
  const blob = new Blob([resultText], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${questionnaire.value.title}_分析结果_${Date.now()}.txt`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  ElMessage.success('已导出分析结果')
}

onMounted(() => {
  // 初始化
})
</script>

<style scoped>
.questionnaire-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  padding: 20px;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.header {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: white;
  text-align: center;
  padding: 40px 20px;
}

.header h1 {
  margin: 0 0 15px 0;
  font-size: 28px;
  font-weight: 600;
}

.description {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
  line-height: 1.6;
}

.main-content {
  padding: 30px;
}

.progress-bar {
  margin-bottom: 30px;
}

.questionnaire-form {
  margin-bottom: 30px;
}

.dimension-section {
  margin-bottom: 40px;
}

.dimension-title {
  font-size: 20px;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #2c3e50;
}

.question-item {
  margin-bottom: 25px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.question-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.question-header {
  margin-bottom: 15px;
}

.question-number {
  display: inline-block;
  width: 30px;
  height: 30px;
  line-height: 30px;
  text-align: center;
  background: #2c3e50;
  color: white;
  border-radius: 50%;
  font-weight: 600;
  margin-right: 10px;
}

.question-content {
  color: #333;
  font-size: 15px;
  line-height: 1.6;
}

.rating-group {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  margin-left: 40px;
}

.rating-option {
  margin-right: 0 !important;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.analysis-content {
  max-height: 60vh;
  overflow-y: auto;
}

.analysis-section {
  margin-bottom: 30px;
}

.analysis-section h3 {
  color: #333;
  margin-bottom: 15px;
  font-size: 18px;
}

.total-score {
  margin-top: 20px;
  font-size: 16px;
  color: #333;
}

.ai-analysis {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  line-height: 1.8;
  color: #333;
}

.error-message {
  padding: 20px;
}

.loading-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #2c3e50;
  font-size: 16px;
}

.loading-message .el-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .questionnaire-view {
    padding: 10px;
  }

  .header {
    padding: 30px 15px;
  }

  .header h1 {
    font-size: 22px;
  }

  .main-content {
    padding: 20px 15px;
  }

  .rating-group {
    margin-left: 0;
    flex-direction: column;
    gap: 10px;
  }

  .question-item {
    padding: 15px;
  }
}
</style>
