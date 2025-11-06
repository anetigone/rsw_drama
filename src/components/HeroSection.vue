<template>
  <section class="hero-section">
    <el-carousel
      :interval="5000"
      arrow="hover"
      indicator-position="absolute"
      height="100%"
      @change="handleSlideChange"
    >
      <el-carousel-item v-for="(activity, index) in activities" :key="index">
        <div 
          class="carousel-item" 
          :style="{ backgroundColor: activity.bgColor }"
          @click="handleActivityClick(activity)"
        >
          <div class="activity-overlay">
            <div class="activity-content">
              <h1 class="hero-title">西南话剧图鉴</h1>
              <p class="hero-subtitle">A Guide to Southwestern Chinese Drama</p>
              <div class="activity-info">
                <h2 class="activity-title">{{ activity.title }}</h2>
                <p class="activity-description">{{ activity.description }}</p>
              </div>
              <el-button class="hero-button" type="primary" @click.stop="handleEnter">点击进入</el-button>
            </div>
          </div>
        </div>
      </el-carousel-item>
    </el-carousel>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Activity {
  id: number
  title: string
  description: string
  bgColor: string
  link: string
}

// 静态示例数据，实际开发时可从API获取
const activities = ref<Activity[]>([
  {
    id: 1,
    title: '西南话剧文献展',
    description: '回顾抗战时期西南地区话剧发展历程',
    bgColor: '#1a2332',
    link: '/exhibition/documents'
  },
  {
    id: 2,
    title: '经典剧目重现',
    description: '重现《放下你的鞭子》等经典剧目',
    bgColor: '#2c3e50',
    link: '/performances/classic'
  },
  {
    id: 3,
    title: '话剧理论研讨会',
    description: '探讨战时西南话剧的历史价值与当代意义',
    bgColor: '#232f3e',
    link: '/symposium/theory'
  },
  {
    id: 4,
    title: '戏剧家口述历史',
    description: '记录老一辈戏剧家的回忆与见解',
    bgColor: '#1e2a38',
    link: '/archive/oral-history'
  }
])

const handleEnter = () => {
  // 滚动到下一个区域
  document.querySelector('.region-section')?.scrollIntoView({ behavior: 'smooth' })
}

const handleActivityClick = (activity: Activity) => {
  // 实际项目中可以使用路由跳转
  console.log('跳转到活动:', activity.link)
  // 示例：如果有router，可以使用router.push(activity.link)
}

const handleSlideChange = (index: number) => {
  console.log('当前活动索引:', index)
}
</script>

<style scoped>
.hero-section {
  position: relative;
  height: 90vh;
  overflow: hidden;
}

.el-carousel {
  height: 100%;
}

.el-carousel__container {
  height: 100%;
}

.el-carousel__item {
  height: 100%;
}

.carousel-item {
  height: 100%;
  position: relative;
  cursor: pointer;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.activity-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.activity-content {
  text-align: center;
  color: #fff;
  padding: 20px;
  max-width: 800px;
}

.hero-title {
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 10px;
  letter-spacing: 3px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.hero-subtitle {
  font-size: 20px;
  margin-bottom: 30px;
  letter-spacing: 1px;
  color: #e0e0e0;
}

.activity-info {
  background-color: rgba(0, 0, 0, 0.6);
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
  backdrop-filter: blur(5px);
}

.activity-title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #c8a97e;
  letter-spacing: 1px;
}

.activity-description {
  font-size: 18px;
  line-height: 1.6;
  color: #e0e0e0;
}

.hero-button {
  background-color: #c8a97e;
  border-color: #c8a97e;
  font-size: 18px;
  padding: 12px 36px;
  letter-spacing: 1px;
  transition: all 0.3s ease;
}

.hero-button:hover {
  background-color: #b08e63;
  border-color: #b08e63;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(200, 169, 126, 0.3);
}

.hero-button:active {
  transform: translateY(0);
}

/* 指示器样式 */
.el-carousel__indicator {
  background-color: rgba(255, 255, 255, 0.5);
}

.el-carousel__indicator.is-active {
  background-color: #c8a97e;
}

/* 箭头样式 */
.el-carousel__arrow {
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
}

.el-carousel__arrow:hover {
  background-color: rgba(0, 0, 0, 0.8);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hero-title {
    font-size: 36px;
  }
  
  .hero-subtitle {
    font-size: 16px;
  }
  
  .activity-title {
    font-size: 24px;
  }
  
  .activity-description {
    font-size: 16px;
  }
  
  .hero-button {
    font-size: 16px;
    padding: 10px 28px;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 28px;
  }
  
  .activity-info {
    padding: 15px;
  }
  
  .activity-title {
    font-size: 20px;
  }
}
</style>