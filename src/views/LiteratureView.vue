<template>
  <div class="literature-view">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-container">
        <h1 class="page-title">经典汇编</h1>
        <p class="page-subtitle">收录西南话剧的经典文献和资料</p>
      </div>
    </div>

    <!-- 文献列表 -->
    <div class="literature-container">
      <div class="literature-list">
        <div 
          v-for="literature in literatures" 
          :key="literature.id"
          class="literature-item"
          @click="navigateToDetail(literature.id)"
        >
          <h3>{{ literature.title }}</h3>
          <p class="author">{{ literature.author }} ({{ literature.year }})</p>
          <p class="description">{{ literature.description }}</p>
          <div class="category">{{ literature.category }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { literatureData } from '../utils/literatureData';
import type { Literature } from '../types/literatureTypes';

const router = useRouter();
const literatures = ref<Literature[]>([]);

onMounted(() => {
  literatures.value = literatureData;
});

const navigateToDetail = (id: string) => {
  router.push(`/literature/${id}`);
};
</script>

<style scoped>
.literature-view {
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

.literature-container {
  max-width: 1200px;
  margin: 60px auto;
  padding: 0 20px;
}

.literature-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 30px;
}

.literature-item {
  background-color: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.literature-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.literature-item h3 {
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
  color: #333;
}

.author {
  margin-bottom: 1rem;
  color: #666;
  font-size: 0.9rem;
}

.description {
  margin-bottom: 1.5rem;
  color: #555;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.category {
  display: inline-block;
  padding: 0.3rem 0.8rem;
  background-color: #e0e0e0;
  border-radius: 20px;
  font-size: 0.8rem;
  color: #666;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    padding: 60px 0;
  }
  
  .page-title {
    font-size: 36px;
  }
  
  .literature-list {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 28px;
  }
  
  .page-subtitle {
    font-size: 16px;
  }
  
  .literature-container {
    padding: 0 15px;
  }
  
  .literature-item {
    padding: 1.5rem;
  }
}
</style>
