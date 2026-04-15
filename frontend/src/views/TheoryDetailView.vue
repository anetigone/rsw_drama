<template>
  <div class="theory-detail-view">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-container">
        <button class="back-button" @click="goBack">
          ← 返回理论列表
        </button>
        <h1 class="page-title">{{ theory?.title || '理论研究' }}</h1>
        <p class="page-date">{{ theory?.date || '' }}</p>
      </div>
    </div>

    <!-- 理论内容 -->
    <div class="theory-content">
      <div class="content-container">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>正在加载理论内容...</p>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="error-state">
          <p>{{ error }}</p>
          <button class="retry-button" @click="loadTheory">重新加载</button>
        </div>

        <!-- 理论内容 -->
        <template v-else>
          <!-- 理论详情 -->
          <div class="theory-details">
            <h2 class="detail-title">{{ theory?.title || '' }}</h2>
            <p class="detail-date">{{ theory?.date || '' }}</p>
            <div class="detail-description" v-html="theoryContent"></div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { TheoryDetail } from '../types/theoryTypes'
import { getTheoryDetailById } from '../utils/theoryData'

const router = useRouter()
const route = useRoute()

const theory = ref<TheoryDetail | null>(null)
const theoryContent = ref<string>('')
const loading = ref<boolean>(true)
const error = ref<string>('')

const loadTheory = async () => {
  loading.value = true
  error.value = ''

  try {
    const id = Number(route.params.id)
    const theoryDetail = await getTheoryDetailById(id)

    if (theoryDetail) {
      theory.value = theoryDetail
      theoryContent.value = theoryDetail.content
    } else {
      error.value = '理论不存在'
    }
  } catch (err) {
    console.error('加载理论失败:', err)
    error.value = '加载理论失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadTheory()
})

const goBack = () => {
  router.push('/theory')
}
</script>

<style scoped>
.theory-detail-view {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.page-header {
  background-color: #1a1a1a;
  color: #fff;
  padding: 60px 0;
  position: relative;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  text-align: center;
}

.back-button {
  position: absolute;
  left: 20px;
  top: 60px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.5);
  color: #fff;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #fff;
}

.page-title {
  font-family: WenYueXHGuYaSong;
  font-size: 42px;
  margin-bottom: 15px;
  letter-spacing: 1px;
}

.page-date {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.8);
}

.theory-content {
  max-width: 1200px;
  margin: 60px auto;
  padding: 0 20px;
}

.content-container {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #c8a97e;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 错误状态 */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: #666;
}

.error-state p {
  margin-bottom: 20px;
  font-size: 16px;
}

.retry-button {
  background-color: #c8a97e;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

.retry-button:hover {
  background-color: #a68c66;
}

.theory-details {
  padding: 40px;
}

.detail-title {
  font-family: WenYueXHGuYaSong;
  font-size: 32px;
  color: #1a1a1a;
  margin-bottom: 15px;
  font-weight: bold;
}

.detail-date {
  font-size: 16px;
  color: #666;
  margin-bottom: 30px;
  font-style: italic;
}

.detail-description {
  font-size: 18px;
  color: #333;
  line-height: 1.8;
  text-align: justify;
}

.detail-description p {
  margin-bottom: 20px;
}

.detail-description h3 {
  font-family: WenYueXHGuYaSong;
  font-size: 24px;
  color: #1a1a1a;
  margin: 30px 0 15px;
  font-weight: bold;
}

.detail-description ul {
  margin: 20px 0;
  padding-left: 20px;
}

.detail-description li {
  margin-bottom: 10px;
  list-style-type: disc;
}

.detail-description img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 20px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    padding: 40px 0;
  }

  .page-title {
    font-size: 32px;
  }

  .back-button {
    top: 40px;
    left: 15px;
    padding: 6px 12px;
    font-size: 12px;
  }

  .theory-details {
    padding: 30px;
  }

  .detail-title {
    font-size: 24px;
  }

  .detail-description {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 24px;
  }

  .page-date {
    font-size: 14px;
  }

  .theory-details {
    padding: 20px;
  }

  .detail-title {
    font-size: 20px;
  }
}
</style>
