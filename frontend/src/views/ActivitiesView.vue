<template>
  <div class="activities-view">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-container">
        <h1 class="page-title">活动纪实</h1>
        <p class="page-subtitle">记录西南话剧的重要活动和演出</p>
      </div>
    </div>

    <!-- 活动列表 -->
    <div class="activities-container">
      <div class="activities-grid">
        <div
          v-for="activity in activities"
          :key="activity.id"
          class="activity-card"
          @click="navigateToDetail(activity.id)"
        >
          <div class="activity-image">
            <img
              :src="getActivityImage(activity.id)"
              :alt="activity.title"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div class="activity-content">
            <h3 class="activity-title">{{ activity.title }}</h3>
            <p class="activity-date">{{ activity.date }}</p>
            <p class="activity-description">{{ activity.description }}</p>
            <div class="activity-link">
              查看详情 <span class="arrow">→</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { activities, getActivityById } from '../utils/activityData'

const router = useRouter()

const navigateToDetail = (id: number) => {
  router.push(`/activity/${id}`)
}

const getActivityImage = (id: number) => {
  const activity = getActivityById(id)
  return activity?.image || `/images/activities/${id}.jpg`
}
</script>

<style scoped>
.activities-view {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.page-header {
  background-color: #1a1a1a;
  color: #fff;
  padding: 80px 0;
  text-align: center;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-title {
  font-family: WenYueXHGuYaSong;
  font-size: 48px;
  margin-bottom: 20px;
  letter-spacing: 2px;
}

.page-subtitle {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.8);
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
}

.activities-container {
  max-width: 1200px;
  margin: 60px auto;
  padding: 0 20px;
}

.activities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 30px;
}

.activity-card {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.activity-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.activity-image {
  height: 200px;
  overflow: hidden;
}

.activity-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.activity-card:hover .activity-image img {
  transform: scale(1.05);
}

.activity-content {
  padding: 20px;
}

.activity-title {
  font-family: WenYueXHGuYaSong;
  font-size: 20px;
  color: #1a1a1a;
  margin-bottom: 10px;
  font-weight: bold;
}

.activity-date {
  font-size: 14px;
  color: #666;
  margin-bottom: 15px;
  font-style: italic;
}

.activity-description {
  font-size: 16px;
  color: #333;
  line-height: 1.6;
  margin-bottom: 20px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.activity-link {
  color: #c8a97e;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: color 0.3s ease;
}

.activity-card:hover .activity-link {
  color: #a68c66;
}

.arrow {
  font-size: 12px;
  transition: transform 0.3s ease;
}

.activity-card:hover .arrow {
  transform: translateX(5px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    padding: 60px 0;
  }
  
  .page-title {
    font-size: 36px;
  }
  
  .activities-grid {
    grid-template-columns: 1fr;
  }
  
  .activity-image {
    height: 250px;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 28px;
  }
  
  .page-subtitle {
    font-size: 16px;
  }
  
  .activities-container {
    padding: 0 15px;
  }
  
  .activity-content {
    padding: 15px;
  }
}
</style>