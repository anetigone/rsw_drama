<template>
  <div class="literature-detail">
    <div class="back-button" @click="goBack">
      &larr; 返回列表
    </div>
    <div v-if="literature" class="detail-content">
      <!-- 上部分：书籍信息和封面 -->
      <div class="top-section">
        <div class="book-cover">
          <!-- 使用占位封面图片 -->
          <img src="/images/classics/literature.jpg" :alt="literature.title" />
        </div>
        <div class="book-info">
          <h1>{{ literature.title }}</h1>
          <div class="meta-info">
            <div class="meta-item">
              <span class="label">作者：</span>
              <span class="value">{{ literature.author }}</span>
            </div>
            <div class="meta-item">
              <span class="label">年份：</span>
              <span class="value">{{ literature.year }}</span>
            </div>
            <div class="meta-item">
              <span class="label">分类：</span>
              <span class="value category-tag">{{ literature.category }}</span>
            </div>
          </div>
          <div class="actions">
            <button class="read-button" @click="openPDFViewer">
              在线阅读
            </button>
            <button class="download-button" @click="downloadLiterature">
              下载文献
            </button>
          </div>
        </div>
      </div>

      <!-- 下部分：书籍详细介绍 -->
      <div class="bottom-section">
        <h2>内容简介</h2>
        <div class="detailed-description">
          {{ literature.description }}
        </div>
      </div>
    </div>
    <div v-else class="loading">
      加载中...
    </div>

    <!-- PDF 查看器 -->
    <PDFViewer
      v-if="showPDFViewer"
      :url="literature?.source || ''"
      @close="closePDFViewer"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { literatureData } from '../utils/literatureData';
import type { Literature } from '../types/literatureTypes';
import PDFViewer from '../components/PDFViewer.vue';

const router = useRouter();
const route = useRoute();
const literature = ref<Literature | null>(null);
const showPDFViewer = ref(false);

onMounted(() => {
  const id = route.params.id as string;
  literature.value = literatureData.find(item => item.id === id) || null;
});

const goBack = () => {
  router.push('/literature');
};

const openPDFViewer = () => {
  showPDFViewer.value = true;
};

const closePDFViewer = () => {
  showPDFViewer.value = false;
};

const downloadLiterature = () => {
  if (literature.value) {
    window.open(literature.value.source, '_blank');
  }
};
</script>

<style scoped>
.literature-detail {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 2rem;
}

.back-button {
  margin-bottom: 2rem;
  cursor: pointer;
  color: #0066cc;
  font-size: 1rem;
}

.back-button:hover {
  text-decoration: underline;
}

.detail-content {
  background-color: #fff;
  padding: 3rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 上部分布局 */
.top-section {
  display: flex;
  gap: 3rem;
  margin-bottom: 3rem;
  padding-bottom: 3rem;
  border-bottom: 1px solid #e0e0e0;
}

.book-cover {
  flex: 0 0 200px;
  height: 300px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 4px;
  overflow: hidden;
}

.book-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.book-info {
  flex: 1;
}

.book-info h1 {
  margin-bottom: 2rem;
  font-size: 2.5rem;
  color: #333;
  font-family: WenYueXHGuYaSong;
}

.meta-info {
  margin-bottom: 2.5rem;
}

.meta-item {
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
}

.meta-item .label {
  font-weight: bold;
  color: #666;
  margin-right: 1rem;
  min-width: 60px;
}

.meta-item .value {
  color: #333;
  font-size: 1.1rem;
}

.category-tag {
  display: inline-block;
  padding: 0.3rem 0.8rem;
  background-color: #e0e0e0;
  border-radius: 20px;
  font-size: 0.9rem;
  color: #666;
}

.actions {
  margin-top: 2rem;
  display: flex;
  gap: 1rem;
}

.read-button,
.download-button {
  padding: 1rem 2.5rem;
  background-color: #0066cc;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.read-button:hover,
.download-button:hover {
  background-color: #0052a3;
}

.download-button {
  background-color: #666;
}

.download-button:hover {
  background-color: #555;
}

/* 下部分布局 */
.bottom-section {
  padding-top: 3rem;
}

.bottom-section h2 {
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
  color: #333;
  font-family: WenYueXHGuYaSong;
}

.detailed-description {
  color: #555;
  line-height: 1.8;
  font-size: 1.1rem;
}

.loading {
  text-align: center;
  margin: 4rem 0;
  font-size: 1.2rem;
  color: #666;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .top-section {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .book-cover {
    flex: 0 0 250px;
    height: 350px;
    margin-bottom: 2rem;
  }
  
  .book-info h1 {
    font-size: 2rem;
  }
  
  .meta-item {
    justify-content: center;
  }
  
  .actions {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .literature-detail {
    padding: 0 1rem;
  }
  
  .detail-content {
    padding: 2rem 1.5rem;
  }
  
  .book-cover {
    flex: 0 0 200px;
    height: 280px;
  }
  
  .book-info h1 {
    font-size: 1.8rem;
  }
  
  .bottom-section h2 {
    font-size: 1.5rem;
  }
}
</style>
