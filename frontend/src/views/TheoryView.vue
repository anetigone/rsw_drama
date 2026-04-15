<template>
  <div class="theory-view">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-container">
        <h1 class="page-title">文思集录</h1>
        <p class="page-subtitle">收录西南话剧理论研究与学术探索</p>
      </div>
    </div>

    <!-- 理论列表 -->
    <div class="theory-container">
      <div class="theory-list">
        <div
          v-for="theory in theories"
          :key="theory.id"
          class="theory-item"
          @click="navigateToDetail(theory.id)"
        >
          <div class="theory-content">
            <h3 class="theory-title">{{ theory.title }}</h3>
            <p class="theory-date">{{ theory.date }}</p>
            <p class="theory-description">{{ theory.description }}</p>
            <div class="theory-link">
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
import { theories } from '../utils/theoryData'

const router = useRouter()

const navigateToDetail = (id: number) => {
  router.push(`/theory/${id}`)
}
</script>

<style scoped>
.theory-view {
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

.theory-container {
  max-width: 1200px;
  margin: 60px auto;
  padding: 0 20px;
}

.theory-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.theory-item {
  background-color: #fff;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
  border-left: 4px solid #c8a97e;
}

.theory-item:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateX(5px);
  border-left-color: #a68c66;
}

.theory-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.theory-title {
  font-family: WenYueXHGuYaSong;
  font-size: 24px;
  color: #1a1a1a;
  font-weight: bold;
  margin: 0;
}

.theory-date {
  font-size: 14px;
  color: #999;
  font-style: italic;
  margin: 0;
}

.theory-description {
  font-size: 16px;
  color: #333;
  line-height: 1.6;
  margin: 0;
}

.theory-link {
  color: #c8a97e;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: color 0.3s ease;
  margin-top: 5px;
}

.theory-item:hover .theory-link {
  color: #a68c66;
}

.arrow {
  font-size: 12px;
  transition: transform 0.3s ease;
}

.theory-item:hover .arrow {
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

  .theory-item {
    padding: 20px;
  }

  .theory-title {
    font-size: 20px;
  }

  .theory-description {
    font-size: 15px;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 28px;
  }

  .page-subtitle {
    font-size: 16px;
  }

  .theory-container {
    padding: 0 15px;
  }

  .theory-item {
    padding: 15px;
  }

  .theory-title {
    font-size: 18px;
  }

  .theory-description {
    font-size: 14px;
  }
}
</style>
