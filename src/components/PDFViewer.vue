<template>
  <div class="pdf-viewer" @keydown="handleKeydown" tabindex="0">
    <div class="pdf-toolbar">
      <div class="toolbar-left">
        <button @click="closeViewer" class="toolbar-icon-btn" title="关闭 (ESC)">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <div class="toolbar-center">
        <button @click="zoomOut" :disabled="scale <= 0.5" class="toolbar-icon-btn" title="缩小">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <line x1="4" y1="10" x2="16" y2="10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>

        <button @click="zoomIn" :disabled="scale >= 3" class="toolbar-icon-btn" title="放大">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 4v12M4 10h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>

        <button @click="fitWidth" class="toolbar-icon-btn" title="适合宽度">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 10h2m8 0h2M9 4v2m0 8v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <rect x="6" y="6" width="8" height="8" stroke="currentColor" stroke-width="1.5" rx="0.5"/>
          </svg>
        </button>

        <div class="page-input-wrapper">
          <input
            ref="pageInputRef"
            v-model="inputPage"
            @keyup.enter="jumpToPage"
            @blur="jumpToPage"
            type="number"
            min="1"
            :max="totalPages"
            class="page-input"
          />
          <span class="page-divider">/</span>
          <span class="total-pages">{{ totalPages }}</span>
        </div>

        <button @click="rotatePage" class="toolbar-icon-btn" title="旋转">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 4a6 6 0 0 1 6 6v1M10 16a6 6 0 0 1-6-6V9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M14 7l2-2 2 2M6 13l-2 2-2-2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="10" cy="10" r="1.5" fill="currentColor"/>
          </svg>
        </button>
      </div>

      <div class="toolbar-right">
        <button @click="downloadPDF" class="toolbar-icon-btn" title="下载">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 13V5M10 13l3-3m-3 3l-3-3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M4 17h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    </div>

    <div
      class="pdf-container"
      ref="containerRef"
      @scroll="handleScroll"
    >
      <div v-if="loading && totalPages === 0" class="loading-overlay">
        <div class="spinner"></div>
        <p>加载中...（大文件可能需要几秒钟）</p>
      </div>
      <div v-else-if="error" class="error-message">
        <p>{{ error }}</p>
      </div>
      <div v-else class="pdf-pages-wrapper">
        <div
          v-for="pageNum in totalPages"
          :key="pageNum"
          :ref="el => setPageRef(pageNum, el)"
          class="pdf-page-item"
          :data-page="pageNum"
        >
          <canvas
            :ref="el => setCanvasRef(pageNum, el)"
            class="pdf-page-canvas"
            :data-page="pageNum"
          ></canvas>
          <div v-if="renderingPages.has(pageNum)" class="page-rendering">
            <div class="spinner small"></div>
            <span>加载第 {{ pageNum }} 页...</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// 设置 PDF.js worker 使用本地文件
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface Props {
  url: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
}>();

const containerRef = ref<HTMLDivElement | null>(null);
const pageInputRef = ref<HTMLInputElement | null>(null);
const currentPage = ref(1);
const inputPage = ref(1);
const currentScrollPage = ref(1);
const totalPages = ref(0);
const scale = ref(1.5);
const rotation = ref(0); // 页面旋转角度
const loading = ref(true);
const error = ref('');
const pageCache = new Map<number, pdfjsLib.PDFPageProxy>();
const renderingPages = ref(new Set<number>());
const renderedPages = ref(new Set<number>());
const pageElements = ref(new Map<number, HTMLElement>());
const canvasElements = ref(new Map<number, HTMLCanvasElement>());
const intersectionObserver = ref<IntersectionObserver | null>(null);

let pdfDoc: pdfjsLib.PDFDocumentProxy | null = null;

// 设置页面元素引用
const setPageRef = (pageNum: number, el: any) => {
  if (el) {
    pageElements.value.set(pageNum, el);
  }
};

const setCanvasRef = (pageNum: number, el: any) => {
  if (el) {
    canvasElements.value.set(pageNum, el);
  }
};

// 加载 PDF 文档
const loadPDF = async () => {
  try {
    loading.value = true;
    error.value = '';

    const loadingTask = pdfjsLib.getDocument({
      url: props.url,
      rangeChunkSize: 65536,
      disableAutoFetch: false,
      disableStream: false,
    });

    pdfDoc = await loadingTask.promise;
    totalPages.value = pdfDoc.numPages;

    // 等待 DOM 更新后设置观察器
    await nextTick();
    setupIntersectionObserver();

    // 初始渲染前几页
    for (let i = 1; i <= Math.min(3, totalPages.value); i++) {
      renderPage(i);
    }
  } catch (err) {
    console.error('PDF加载失败:', err);
    error.value = '无法加载PDF文件，请检查文件是否损坏或链接是否正确';
  } finally {
    loading.value = false;
  }
};

// 渲染指定页面
const renderPage = async (pageNum: number) => {
  if (!pdfDoc || renderedPages.value.has(pageNum) || renderingPages.value.has(pageNum)) return;

  try {
    renderingPages.value.add(pageNum);

    let page = pageCache.get(pageNum);
    if (!page) {
      page = await pdfDoc.getPage(pageNum);
      pageCache.set(pageNum, page);
    }

    const canvas = canvasElements.value.get(pageNum);
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const viewport = page.getViewport({ scale: scale.value });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
      canvas: canvas,
    };

    await page.render(renderContext).promise;
    renderedPages.value.add(pageNum);
  } catch (err) {
    console.error('页面渲染失败:', err);
  } finally {
    renderingPages.value.delete(pageNum);
  }
};

// 设置交叉观察器用于懒加载
const setupIntersectionObserver = () => {
  if (!containerRef.value) return;

  intersectionObserver.value = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const pageNum = parseInt(entry.target.getAttribute('data-page') || '0');
          if (pageNum > 0 && !renderedPages.value.has(pageNum)) {
            renderPage(pageNum);
          }
        }
      });
    },
    {
      root: containerRef.value,
      rootMargin: '300px',
      threshold: 0,
    }
  );

  // 观察所有页面元素
  pageElements.value.forEach((element) => {
    if (intersectionObserver.value) {
      intersectionObserver.value.observe(element);
    }
  });
};

// 处理滚动事件
const handleScroll = () => {
  if (!containerRef.value) return;

  const container = containerRef.value;
  const scrollTop = container.scrollTop;
  const containerHeight = container.clientHeight;

  // 找到当前可见的页面
  let visiblePage = 1;
  for (let i = 1; i <= totalPages.value; i++) {
    const pageElement = pageElements.value.get(i);
    if (pageElement) {
      const pageTop = pageElement.offsetTop;
      const pageBottom = pageTop + pageElement.offsetHeight;

      // 检查页面是否在可见区域中心
      const viewportCenter = scrollTop + containerHeight / 2;
      if (pageTop <= viewportCenter && pageBottom >= viewportCenter) {
        visiblePage = i;
        break;
      }
    }
  }

  currentScrollPage.value = visiblePage;
  currentPage.value = visiblePage;
  inputPage.value = visiblePage;
};

// 跳转到指定页码
const jumpToPage = async () => {
  let pageNum = parseInt(String(inputPage.value));
  if (isNaN(pageNum)) {
    inputPage.value = currentScrollPage.value;
    return;
  }

  pageNum = Math.max(1, Math.min(pageNum, totalPages.value));
  inputPage.value = pageNum;

  const pageElement = pageElements.value.get(pageNum);
  if (pageElement && containerRef.value) {
    pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // 确保目标页面已渲染
    if (!renderedPages.value.has(pageNum)) {
      renderPage(pageNum);
    }

    // 预加载相邻页面
    const preloadPages = [pageNum - 1, pageNum + 1, pageNum + 2];
    preloadPages.forEach(p => {
      if (p > 0 && p <= totalPages.value && !renderedPages.value.has(p)) {
        setTimeout(() => renderPage(p), 100);
      }
    });
  }
};

// 缩放控制
const zoomIn = async () => {
  if (scale.value < 3) {
    scale.value = Math.min(3, scale.value + 0.25);
    await rerenderAllPages();
  }
};

const zoomOut = async () => {
  if (scale.value > 0.5) {
    scale.value = Math.max(0.5, scale.value - 0.25);
    await rerenderAllPages();
  }
};

// 重新渲染所有页面（缩放时）
const rerenderAllPages = async () => {
  renderedPages.value.clear();
  renderingPages.value.clear();
  pageCache.clear();

  await nextTick();

  // 重新渲染当前可见的页面
  for (let i = 1; i <= Math.min(currentScrollPage.value + 3, totalPages.value); i++) {
    renderPage(i);
  }
};

// 关闭查看器
const closeViewer = () => {
  emit('close');
};

// 适合宽度
const fitWidth = async () => {
  if (!containerRef.value || !pageElements.value.size) return;

  const firstPage = pageElements.value.get(1);
  if (!firstPage) return;

  const containerWidth = containerRef.value.clientWidth - 80; // 减去 padding
  const pageCanvas = canvasElements.value.get(1);
  if (!pageCanvas) return;

  const originalWidth = pageCanvas.width;
  const newScale = containerWidth / originalWidth;

  scale.value = Math.max(0.5, Math.min(3, newScale));
  await rerenderAllPages();
};

// 旋转页面
const rotatePage = async () => {
  rotation.value = (rotation.value + 90) % 360;
  await rerenderAllPages();
};

// 下载 PDF
const downloadPDF = () => {
  window.open(props.url, '_blank');
};

// 键盘导航
const handleKeydown = (e: KeyboardEvent) => {
  switch(e.key) {
    case 'ArrowDown':
    case 'ArrowRight':
      e.preventDefault();
      if (containerRef.value) {
        containerRef.value.scrollBy({ top: 400, behavior: 'smooth' });
      }
      break;
    case 'ArrowUp':
    case 'ArrowLeft':
      e.preventDefault();
      if (containerRef.value) {
        containerRef.value.scrollBy({ top: -400, behavior: 'smooth' });
      }
      break;
    case '+':
    case '=':
      zoomIn();
      break;
    case '-':
      zoomOut();
      break;
    case 'Escape':
      closeViewer();
      break;
  }
};

onMounted(() => {
  loadPDF();
});

onUnmounted(() => {
  if (intersectionObserver.value) {
    intersectionObserver.value.disconnect();
  }
  if (pdfDoc) {
    pdfDoc.destroy();
  }
});

watch(() => props.url, () => {
  loadPDF();
});
</script>

<style scoped>
.pdf-viewer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #808080;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  outline: none;
}

.pdf-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 2rem;
  background-color: #f5f5f5;
  border-bottom: 1px solid #d0d0d0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.toolbar-left,
.toolbar-center,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.toolbar-center {
  gap: 1rem;
}

.toolbar-icon-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 4px;
}

.toolbar-icon-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.toolbar-icon-btn:active {
  background-color: rgba(0, 0, 0, 0.1);
}

.toolbar-icon-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.toolbar-icon-btn:disabled:hover {
  background-color: transparent;
}

.toolbar-icon-btn svg {
  width: 20px;
  height: 20px;
}

.page-input-wrapper {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.3rem 0.6rem;
  background-color: transparent;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.page-input-wrapper:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.page-input {
  width: 40px;
  padding: 0.2rem 0.3rem;
  border: none;
  background: transparent;
  text-align: center;
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.page-input:focus {
  outline: none;
  background-color: rgba(255, 255, 255, 0.8);
}

.page-divider {
  color: #666;
  font-size: 14px;
  font-weight: 500;
}

.total-pages {
  color: #666;
  font-size: 14px;
  font-weight: 500;
}

.pdf-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  background: linear-gradient(135deg, #808080 0%, #909090 100%);
  padding: 2rem;
  scroll-behavior: smooth;
}

.pdf-pages-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  margin: 0 auto;
}

.pdf-page-item {
  position: relative;
  width: 100%;
  max-width: 1000px;
  min-height: 400px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  margin: 0 auto;
}

.pdf-page-canvas {
  max-width: 100%;
  height: auto;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  background-color: #fff;
  border-radius: 4px;
  display: block;
  margin: 0 auto;
}

.page-rendering {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(255, 255, 255, 0.95);
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 0.9rem;
  color: #333;
  z-index: 10;
}

.loading-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #333;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e0e0e0;
  border-top: 4px solid #0066cc;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.spinner.small {
  width: 20px;
  height: 20px;
  border-width: 2px;
  margin-bottom: 0;
}

.error-message {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #dc3545;
  font-size: 1.1rem;
  text-align: center;
  padding: 2rem;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  margin: 2rem;
}

/* 滚动条样式 */
.pdf-container::-webkit-scrollbar {
  width: 10px;
}

.pdf-container::-webkit-scrollbar-track {
  background: #707070;
}

.pdf-container::-webkit-scrollbar-thumb {
  background: #505050;
  border-radius: 5px;
}

.pdf-container::-webkit-scrollbar-thumb:hover {
  background: #404040;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .pdf-toolbar {
    padding: 0.5rem 1rem;
  }

  .toolbar-icon-btn {
    width: 32px;
    height: 32px;
  }

  .toolbar-icon-btn svg {
    width: 18px;
    height: 18px;
  }

  .page-input {
    width: 35px;
    font-size: 13px;
  }

  .pdf-container {
    padding: 1rem;
  }

  .pdf-pages-wrapper {
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .pdf-toolbar {
    padding: 0.4rem 0.8rem;
  }

  .toolbar-center {
    gap: 0.5rem;
  }

  .toolbar-icon-btn {
    width: 28px;
    height: 28px;
  }

  .toolbar-icon-btn svg {
    width: 16px;
    height: 16px;
  }
}
</style>
