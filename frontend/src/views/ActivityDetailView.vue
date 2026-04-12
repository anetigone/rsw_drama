<template>
  <div class="activity-detail-view">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-container">
        <button class="back-button" @click="goBack">
          ← 返回活动列表
        </button>
        <h1 class="page-title">{{ activity?.title || '活动详情' }}</h1>
        <p class="page-date">{{ activity?.date || '' }}</p>
      </div>
    </div>

    <!-- 活动内容 -->
    <div class="activity-content">
      <div class="content-container">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>正在加载活动内容...</p>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="error-state">
          <p>{{ error }}</p>
          <button class="retry-button" @click="loadActivity">重新加载</button>
        </div>

        <!-- 活动内容 -->
        <template v-else>
          <!-- 活动图片 -->
          <div class="activity-image">
            <img :src="getActivityImage()" :alt="activity?.title || ''" />
          </div>

          <!-- 活动详情 -->
          <div class="activity-details">
            <h2 class="detail-title">{{ activity?.title || '' }}</h2>
            <p class="detail-date">{{ activity?.date || '' }}</p>
            <div class="detail-description" v-html="activityContent"></div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { ActivityDetail } from '../types/activityTypes'
import { getActivityDetailById } from '../utils/activityData'

const router = useRouter()
const route = useRoute()

const activity = ref<ActivityDetail | null>(null)
const activityContent = ref<string>('')
const loading = ref<boolean>(true)
const error = ref<string>('')

const loadActivity = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const id = Number(route.params.id)
    const activityDetail = await getActivityDetailById(id)
    
    if (activityDetail) {
      activity.value = activityDetail
      activityContent.value = activityDetail.content
    } else {
      error.value = '活动不存在'
    }
  } catch (err) {
    console.error('加载活动失败:', err)
    error.value = '加载活动失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadActivity()
})

const goBack = () => {
  router.push('/activities')
}

const getActivityImage = () => {
  return activity.value?.image || `/images/activities/${route.params.id}.jpg`
}
</script>

<style scoped>
.activity-detail-view {
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

.activity-content {
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

.activity-image {
  height: 400px;
  overflow: hidden;
}

.activity-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.activity-details {
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

  .activity-image {
    height: 300px;
  }

  .activity-details {
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

  .activity-image {
    height: 200px;
  }

  .activity-details {
    padding: 20px;
  }

  .detail-title {
    font-size: 20px;
  }
}
</style>