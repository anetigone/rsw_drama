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
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <el-icon class="is-loading"><Loading /></el-icon>
        <p>加载中...</p>
      </div>

      <!-- 文献列表 -->
      <div v-else-if="literatures.length > 0" class="literature-list">
        <div
          v-for="literature in literatures"
          :key="literature.id"
          class="literature-item"
          @click="navigateToDetail(literature.id)"
        >
          <div class="literature-cover">
            <img :src="literature.imageUrl" :alt="literature.title" />
          </div>
          <div class="literature-content">
            <h3>{{ literature.title }}</h3>
            <p class="author">{{ literature.author }} ({{ literature.year }})</p>
            <p class="description">{{ literature.description || '暂无描述' }}</p>
            <div class="category">{{ literature.category }}</div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <p>暂无文献数据</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onActivated } from 'vue';
import { useRouter } from 'vue-router';
import { useLiteratureStore } from '../stores/literature';
import { storeToRefs } from 'pinia';
import { ElMessage } from 'element-plus';

// 定义组件名称，供 keep-alive 使用
defineOptions({
  name: 'LiteratureView'
});

const router = useRouter();
const literatureStore = useLiteratureStore();
const { literatures, loading } = storeToRefs(literatureStore);

// 首次挂载时加载数据
onMounted(async () => {
  try {
    await literatureStore.fetchLiteratures();
  } catch (error) {
    ElMessage.error('加载文献列表失败，请稍后重试');
  }
});

// 当组件被 keep-alive 激活时（从详情页返回），不需要重新加载
// 数据已经在 store 中缓存了
onActivated(() => {
  // 可以在这里添加一些激活时的逻辑
  // 但不需要重新获取数据，因为数据已经在 store 中
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

.loading-state,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
  font-size: 1.1rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.literature-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 30px;
}

.literature-item {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.literature-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.literature-cover {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background-color: #f5f5f5;
}

.literature-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.literature-content {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.literature-item h3 {
  margin-bottom: 0.5rem;
  font-size: 1.3rem;
  color: #333;
}

.author {
  margin-bottom: 0.8rem;
  color: #666;
  font-size: 0.9rem;
}

.description {
  margin-bottom: 1rem;
  color: #555;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.category {
  display: inline-block;
  padding: 0.3rem 0.8rem;
  background-color: #e0e0e0;
  border-radius: 20px;
  font-size: 0.8rem;
  color: #666;
  align-self: flex-start;
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
