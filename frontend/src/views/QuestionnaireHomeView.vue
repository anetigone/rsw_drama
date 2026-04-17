<template>
  <div class="questionnaire-home">
    <div class="container">
      <div class="header">
        <h1>项目问卷调查</h1>
        <p class="subtitle">通过科学问卷评估，深入了解戏剧对心理疗愈和红色记忆的影响力</p>
      </div>

      <div class="questionnaire-list">
        <el-card
          v-for="item in questionnaireList"
          :key="item.type"
          class="questionnaire-card"
          shadow="hover"
        >
          <template #header>
            <div class="card-header">
              <h2>{{ item.title }}</h2>
              <el-tag :type="item.tagType">{{ item.tag }}</el-tag>
            </div>
          </template>

          <div class="card-content">
            <p class="description">{{ item.description }}</p>

            <div class="info-section">
              <div class="info-item">
                <el-icon><Document /></el-icon>
                <span>{{ item.questionCount }} 道题目</span>
              </div>
              <div class="info-item">
                <el-icon><Timer /></el-icon>
                <span>预计耗时: {{ item.estimatedTime }}</span>
              </div>
              <div class="info-item">
                <el-icon><Grid /></el-icon>
                <span>{{ item.dimensionCount }} 个维度</span>
              </div>
            </div>

            <div class="dimensions">
              <h4>评估维度:</h4>
              <el-tag
                v-for="dim in item.dimensions"
                :key="dim"
                size="small"
                style="margin: 5px"
              >
                {{ dim }}
              </el-tag>
            </div>

            <el-button
              type="primary"
              size="large"
              class="start-btn"
              @click="handleStart(item.type)"
            >
              开始填写
              <el-icon class="el-icon--right"><ArrowRight /></el-icon>
            </el-button>
          </div>
        </el-card>
      </div>

      <div class="instructions">
        <el-card>
          <template #header>
            <h3>填写说明</h3>
          </template>
          <div class="instruction-content">
            <p><el-icon color="#67C23A"><CircleCheck /></el-icon> 请根据真实体验如实填写，答案无对错之分</p>
            <p><el-icon color="#67C23A"><CircleCheck /></el-icon> 每题采用 1-5 分计分制，请选择最符合您情况的选项</p>
            <p><el-icon color="#67C23A"><CircleCheck /></el-icon> 填写完成后，系统将自动调用 AI 进行深度分析</p>
            <p><el-icon color="#67C23A"><CircleCheck /></el-icon> 两份问卷可单独填写，也可以都填写以获得更全面的分析</p>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  Document,
  Timer,
  Grid,
  ArrowRight,
  CircleCheck
} from '@element-plus/icons-vue'
import { QuestionnaireType } from '../types/questionnaireTypes'

const router = useRouter()

interface QuestionnaireInfo {
  type: QuestionnaireType
  title: string
  tag: string
  tagType: 'success' | 'warning' | 'info' | 'danger'
  description: string
  questionCount: number
  estimatedTime: string
  dimensionCount: number
  dimensions: string[]
}

const questionnaireList = ref<QuestionnaireInfo[]>([
  {
    type: QuestionnaireType.PSYCHOLOGICAL,
    title: '戏剧心理疗愈效果评估问卷',
    tag: '推荐',
    tagType: 'success',
    description:
      '评估戏剧体验对个人心理疗愈的影响，从情绪调节、自我接纳、压力缓解、人际联结四个维度全面分析戏剧的心理疗愈效果。',
    questionCount: 20,
    estimatedTime: '5-8 分钟',
    dimensionCount: 4,
    dimensions: ['情绪调节', '自我接纳', '压力缓解', '人际联结']
  },
  {
    type: QuestionnaireType.RED_MEMORY,
    title: '戏剧红色记忆影响力评估问卷',
    tag: '热门',
    tagType: 'warning',
    description:
      '评估戏剧对红色记忆的传递、唤醒及影响力效果，从记忆唤醒、情感共鸣、价值认同、行为倾向四个维度分析红色记忆的影响力。',
    questionCount: 20,
    estimatedTime: '5-8 分钟',
    dimensionCount: 4,
    dimensions: ['记忆唤醒', '情感共鸣', '价值认同', '行为倾向']
  }
])

const handleStart = (type: QuestionnaireType) => {
  router.push({
    name: 'Questionnaire',
    query: { type }
  })
}
</script>

<style scoped>
.questionnaire-home {
  min-height: 100vh;
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  padding: 40px 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  text-align: center;
  color: white;
  margin-bottom: 50px;
}

.header h1 {
  font-size: 36px;
  font-weight: 600;
  margin: 0 0 15px 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.subtitle {
  font-size: 18px;
  opacity: 0.9;
  margin: 0;
}

.questionnaire-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
}

.questionnaire-card {
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.questionnaire-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.card-content {
  padding: 10px 0;
}

.description {
  color: #666;
  line-height: 1.6;
  margin-bottom: 20px;
  min-height: 60px;
}

.info-section {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #555;
  font-size: 14px;
}

.info-item .el-icon {
  color: #2c3e50;
}

.dimensions {
  margin-bottom: 25px;
}

.dimensions h4 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 14px;
}

.start-btn {
  width: 100%;
  font-size: 16px;
  padding: 15px;
  border-radius: 8px;
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  border: none;
}

.start-btn:hover {
  background: linear-gradient(135deg, #1a252f 0%, #2c3e50 100%);
}

.instructions {
  max-width: 800px;
  margin: 0 auto;
}

.instructions h3 {
  margin: 0;
  color: #333;
}

.instruction-content {
  color: #555;
  line-height: 2;
}

.instruction-content p {
  margin: 10px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.instruction-content .el-icon {
  flex-shrink: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .questionnaire-home {
    padding: 20px 10px;
  }

  .header h1 {
    font-size: 28px;
  }

  .subtitle {
    font-size: 16px;
  }

  .questionnaire-list {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .info-section {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
