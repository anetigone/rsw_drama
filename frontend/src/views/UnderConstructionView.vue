<template>
  <div class="under-construction">
    <div class="construction-container">
      <div class="construction-icon">🚧</div>
      <h1 class="construction-title">页面开发中</h1>
      <p class="construction-description">
        该功能正在开发中，敬请期待...
      </p>
      <button class="back-button" @click="goBack">
        返回上一页
      </button>
      <button class="home-button" @click="goHome">
        回到首页
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push({ name: 'Home' })
  }
}

const goHome = () => {
  router.push({ name: 'Home' })
}
</script>

<style scoped>
.under-construction {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.construction-container {
  text-align: center;
  background: white;
  padding: 60px 40px;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 100%;
}

.construction-icon {
  font-size: 80px;
  margin-bottom: 20px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

.construction-title {
  font-size: 32px;
  font-weight: bold;
  color: #333;
  margin: 0 0 20px 0;
}

.construction-description {
  font-size: 18px;
  color: #666;
  margin: 0 0 40px 0;
  line-height: 1.6;
}

.back-button,
.home-button {
  padding: 12px 30px;
  font-size: 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  margin: 0 10px;
}

.back-button {
  background: #667eea;
  color: white;
}

.back-button:hover {
  background: #5568d3;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.home-button {
  background: #f0f0f0;
  color: #333;
}

.home-button:hover {
  background: #e0e0e0;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .construction-container {
    padding: 40px 20px;
  }

  .construction-icon {
    font-size: 60px;
  }

  .construction-title {
    font-size: 24px;
  }

  .construction-description {
    font-size: 16px;
  }

  .back-button,
  .home-button {
    display: block;
    width: 100%;
    margin: 10px 0;
  }
}
</style>
