<template>
  <section class="classics-section">
    <div class="section-container">
      <h2 class="section-title">THE CLASSICS</h2>
      <p class="section-subtitle">经典汇编</p>
      
      <!-- 走马灯区域 -->
      <div class="carousel-container">
        <el-carousel
          class="classics-carousel"
          arrow="always"
          :loop="true"
          show-indicators="false"
          :interval="5000"
          :initial-index="0"
          direction="horizontal"
          @change="handleCarouselChange"
        >
          <el-carousel-item v-for="(item, index) in carouselItems" :key="index">
            <!-- 内容标签 -->
            <div class="classic-tag">{{ item.tag }}</div>
            <!-- 图片容器 -->
            <div class="image-wrapper">
              <img :src="item.imageUrl" :alt="item.title" class="carousel-image" />
            </div>
          </el-carousel-item>
        </el-carousel>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// 定义走马灯数据类型
interface CarouselItem {
  tag: string;
  title: string;
  imageUrl: string;
}

// 走马灯数据
const carouselItems = ref<CarouselItem[]>([
  {
    tag: '- 文献集 -',
    title: '文献集',
    imageUrl: '/images/classics/literature.jpg'
  },
  {
    tag: '- 话剧集 -',
    title: '话剧集',
    imageUrl: '/images/classics/opera.jpg'
  },
  {
    tag: '- 翻译集 -',
    title: '翻译集',
    imageUrl: '/images/classics/translation.jpg'
  }
]);

// 处理走马灯切换事件
const handleCarouselChange = (index: number) => {
  const current = carouselItems.value[index];
  if (current) {
    console.log(`当前显示第 ${index + 1} 项：${current.title}`);
  }
};
</script>

<style scoped>
.classics-section {
  padding: 80px 0;
  background-color: #fff;
}

.section-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-title {
  font-family: WenYueXHGuYaSong;
  font-size: 18px;
  color: #333;
  text-align: center;
  margin-bottom: 10px;
  letter-spacing: 2px;
  font-weight: normal;
}

.section-subtitle {
  font-family: WenYueXHGuYaSong;
  font-size: 36px;
  color: #000;
  text-align: center;
  margin-bottom: 60px;
  letter-spacing: 1px;
  font-weight: bold;
}

/* 走马灯容器 */
.carousel-container {
  width: 60%;
  margin: 0 auto;
  position: relative;
}

/* 走马灯样式 */
.classics-carousel {
  width: 100%;
  aspect-ratio: 16/10;
  background-color: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

/* 确保走马灯容器内部比例一致 */
.classics-carousel :deep(.el-carousel__container) {
  height: 100% !important;
  aspect-ratio: 16/10;
}

.classics-carousel :deep(.el-carousel__item) {
  height: 100% !important;
}

/* 内容标签样式 */
.classic-tag {
  position: absolute;
  top: 20px;
  left: 20px;
  color: #000;
  background-color: #fff;
  padding: 8px 20px;
  font-size: 16px;
  letter-spacing: 1px;
  z-index: 10;
  font-family: 'WenYueXHGuYaSong', serif;
}

/* 图片容器 */
.image-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* 图片样式 */
.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 70% center;
  transition: transform 0.5s ease;
  filter: grayscale(30%);
}

.classics-carousel:hover :deep(.el-carousel__item.is-active) .carousel-image {
  transform: scale(1.02);
}

/* 自定义箭头样式 */
.classics-carousel :deep(.el-carousel__arrow) {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: #fff;
  border: 1px solid #ddd;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 5;
  color: #333;
  font-size: 18px;
  opacity: 1;
}

.classics-carousel :deep(.el-carousel__arrow:hover) {
  background-color: #e0e0e0;
  transform: translateY(-50%) scale(1.1);
  color: #333;
}

.classics-carousel :deep(.el-carousel__arrow--left) {
  left: 20px;
}

.classics-carousel :deep(.el-carousel__arrow--right) {
  right: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .classics-section {
    padding: 60px 0;
  }
  
  .section-subtitle {
    font-size: 28px;
  }
  
  .carousel-container {
    width: 90%;
    padding: 10px;
  }
  
  .classics-carousel {
    /* 确保在移动设备上高度自适应 */
    height: auto !important;
  }
  
  .classics-carousel :deep(.el-carousel__container) {
    height: auto !important;
  }
  
  .classics-carousel :deep(.el-carousel__item) {
    height: auto !important;
    min-height: 200px;
    aspect-ratio: 16/10;
  }
  
  .classic-tag {
    top: 15px;
    left: 15px;
    padding: 6px 15px;
    font-size: 14px;
  }
  
  .classics-carousel :deep(.el-carousel__arrow) {
    width: 32px;
    height: 32px;
    font-size: 16px;
  }
  
  .classics-carousel :deep(.el-carousel__arrow--left) {
    left: 10px;
  }
  
  .classics-carousel :deep(.el-carousel__arrow--right) {
    right: 10px;
  }
}
</style>