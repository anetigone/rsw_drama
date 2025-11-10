<template>
  <section class="hero-section" :class="{ 'collapsed': isCollapsed }">
    <!-- 收起/缩小按钮 -->
      <div class="collapse-button" @click="toggleCollapse">
        <el-icon v-if="isCollapsed"><ArrowDown /></el-icon>
        <el-icon v-else><ArrowUp /></el-icon>
      </div>
    
    <el-carousel
      :interval="4000"
      arrow="hover"
      indicator-position="outside"
      height="100%"
      :autoplay="!isMouseHover"
      transition="fade"
      :duration="400"
      @change="handleSlideChange"
      @mouseenter="isMouseHover = true"
      @mouseleave="isMouseHover = false"
    >
      <el-carousel-item v-for="(activity, index) in activities" :key="index">
        <div 
          class="carousel-item" 
          :style="{ 
            backgroundColor: activity.bgColor
          }"
          @click="handleActivityClick(activity)"
        >
          <div class="activity-overlay" 
            :style="{ 
              backgroundImage: `url('/images/heroSection/1.jpg')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }"
          >
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
import { ArrowUp, ArrowDown } from '@element-plus/icons-vue'

interface Activity {
  id: number
  title: string
  description: string
  bgColor: string
  link: string
  brief: string
}

// 静态示例数据，实际开发时可从API获取
const activities = ref<Activity[]>([
  {
    id: 1,
    title: '西南话剧文献展',
    description: '回顾抗战时期西南地区话剧发展历程',
    bgColor: '#1a2332',
    link: '/exhibition/documents',
    brief: '珍贵文献见证西南话剧发展脉络'
  },
  {
    id: 2,
    title: '经典剧目重现',
    description: '重现《放下你的鞭子》等经典剧目',
    bgColor: '#2c3e50',
    link: '/performances/classic',
    brief: '经典剧目穿越时空焕发新光彩'
  },
  {
    id: 3,
    title: '话剧理论研讨会',
    description: '探讨战时西南话剧的历史价值与当代意义',
    bgColor: '#232f3e',
    link: '/symposium/theory',
    brief: '学术研讨探寻话剧文化传承之路'
  },
  {
    id: 4,
    title: '戏剧家口述历史',
    description: '记录老一辈戏剧家的回忆与见解',
    bgColor: '#1e2a38',
    link: '/archive/oral-history',
    brief: '口述历史留存珍贵戏剧人记忆'
  }
])

// 响应式状态
const isCollapsed = ref(false)
const isMouseHover = ref(false)
const currentSlideIndex = ref(0)

// 收起/展开轮播图
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

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
  currentSlideIndex.value = index
  console.log('当前活动索引:', index)
}
</script>

<style scoped>
.hero-section {
  position: relative;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  overflow: hidden;
  /* PC端高度：屏幕可视区的40%-55% */
  height: 65vh;
  transition: height 0.5s ease;
}

/* 收起状态 */
.hero-section.collapsed {
  height: 25vh;
}

/* 移动端：全屏宽度，高度为屏幕可视区的50%-60% */
@media (max-width: 768px) {
  .hero-section {
    height: 55vh;
  }
  
  .hero-section.collapsed {
    height: 20vh;
  }
}

.el-carousel {
  height: 100%;
  width: 100%;
}

.el-carousel__container {
  height: 100%;
}

.el-carousel__item {
  height: 100%;
}

/* 轮播项使用背景图片并保持16:9比例 */
.carousel-item {
  height: 100%;
  position: relative;
  cursor: pointer;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

/* 确保在不同比例下核心内容不被裁剪 */
.carousel-item::before {
  content: '';
  display: block;
  padding-top: 56.25%; /* 16:9 宽高比 */
  position: absolute;
  width: 100%;
  height: 0;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
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
  backdrop-filter: blur(2px);
}

.activity-content {
  text-align: center;
  color: #fff;
  padding: 20px;
  max-width: 800px;
}

.hero-title {
  font-family: RuiYiSong;
  font-size: 48px;
  margin-bottom: 10px;
  letter-spacing: 3px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.hero-subtitle {
  font-family: RuiYiSong;
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

/* 收起/缩小按钮 */
.collapse-button {
  position: absolute;
  top: 15px;
  right: 15px;
  z-index: 10;
  width: 36px;
  height: 36px;
  background-color: rgba(0, 0, 0, 0.6);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.collapse-button:hover {
  background-color: rgba(0, 0, 0, 0.8);
  transform: scale(1.1);
}

/* 活动简介短句 */
.activity-brief {
  position: absolute;
  bottom: -40px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 14px;
  white-space: nowrap;
  max-width: 80%;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

/* 指示器样式 - 位置靠下且不遮挡内容 */
.el-carousel__indicators--outside {
  bottom: -10px;
}

.el-carousel__indicator {
  background-color: rgba(255, 255, 255, 0.5);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.el-carousel__indicator.is-active {
  background-color: #c8a97e;
  width: 24px;
  border-radius: 4px;
}

/* 箭头样式 */
.el-carousel__arrow {
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.el-carousel__arrow:hover {
  background-color: rgba(0, 0, 0, 0.8);
  transform: scale(1.1);
}

/* 适配收起状态 */
.hero-section.collapsed .activity-brief {
  transform: translateX(-50%) scale(0.9);
}

.hero-section.collapsed .activity-content {
  transform: scale(0.85);
  transition: transform 0.3s ease;
}

/* 优化间距，仅在收起状态下增加间距 */
.hero-section.collapsed + * {
  margin-top: 30px;
}

/* 正常状态下的合理间距 */
.hero-section:not(.collapsed) + * {
  margin-top: 20px;
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