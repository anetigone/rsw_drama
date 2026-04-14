<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import { ref } from 'vue'
import GlobalNavbar from './components/GlobalNavbar.vue'

const router = useRouter()
const isRouteLoading = ref(false)

// 路由加载状态监听
router.beforeEach(() => {
  isRouteLoading.value = true
})

router.afterEach(() => {
  // 延迟一点时间，避免闪烁
  setTimeout(() => {
    isRouteLoading.value = false
  }, 100)
})
</script>

<template>
  <div class="app-container">
    <GlobalNavbar />

    <!-- 全局加载指示器 -->
    <div v-if="isRouteLoading" class="global-loading">
      <div class="loading-spinner"></div>
      <p>页面加载中...</p>
    </div>

    <RouterView v-slot="{ Component }">
      <keep-alive include="LiteratureView,LiteratureDetailView">
        <component :is="Component" />
      </keep-alive>
    </RouterView>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
}

.global-loading {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  z-index: 9999;
  background: rgba(255, 255, 255, 0.95);
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #c8a97e;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.global-loading p {
  margin: 0;
  color: #666;
  font-size: 16px;
}
</style>