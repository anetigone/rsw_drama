<template>
  <div class="literature-detail">
    <div class="back-button" @click="goBack">
      &larr; 返回列表
    </div>
    <div v-if="literature" class="detail-content">
      <!-- 上部分：书籍信息和封面 -->
      <div class="top-section">
        <div class="book-cover">
          <img :src="literature.imageUrl" :alt="literature.title" />
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
      :url="readUrl"
      @close="closePDFViewer"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onActivated } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useLiteratureStore } from '../stores/literature';
import type { Literature } from '../types/literatureTypes';
import PDFViewer from '../components/PDFViewer.vue';
import { ElMessage } from 'element-plus';

// 定义组件名称，供 keep-alive 使用
defineOptions({
  name: 'LiteratureDetailView'
});

const router = useRouter();
const route = useRoute();
const literatureStore = useLiteratureStore();

const literature = ref<Literature | null>(null);
const showPDFViewer = ref(false);
const readUrl = ref<string>('');

const loadLiterature = async () => {
  try {
    const id = route.params.id as string;
    literature.value = await literatureStore.fetchLiteratureById(id);
  } catch (error) {
    console.error('加载文献详情失败:', error);
    ElMessage.error('加载文献详情失败，请稍后重试');
  }
};

// 监听路由参数变化，当 ID 变化时重新加载
watch(() => route.params.id, async (newId, oldId) => {
  if (newId && newId !== oldId) {
    await loadLiterature();
  }
});

// 首次挂载时加载数据
onMounted(async () => {
  await loadLiterature();
});

// 当组件被 keep-alive 激活时（从列表页进入不同的详情页）
// 这里不需要做任何事，因为 watch 已经会处理路由参数变化
onActivated(() => {
  // 数据已经在 store 中缓存，或者通过 watch 处理了路由变化
});

const goBack = () => {
  router.push('/literature');
};

const openPDFViewer = async () => {
  try {
    if (literature.value) {
      // 从 store 获取预签名阅读URL（自动缓存）
      const url = await literatureStore.getReadUrl(literature.value.id);
      readUrl.value = url;
      showPDFViewer.value = true;
    }
  } catch (error) {
    console.error('打开PDF阅读器失败:', error);
    ElMessage.error('打开PDF阅读器失败，请稍后重试');
  }
};

const closePDFViewer = () => {
  showPDFViewer.value = false;
};

const downloadLiterature = async () => {
  try {
    if (literature.value) {
      // 从 store 获取下载URL（自动缓存，会自动增加下载计数）
      const url = await literatureStore.getDownloadUrl(literature.value.id);
      // 打开下载链接
      window.open(url, '_blank');
      ElMessage.success('开始下载');
    }
  } catch (error) {
    console.error('下载文献失败:', error);
    ElMessage.error('下载文献失败，请稍后重试');
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
