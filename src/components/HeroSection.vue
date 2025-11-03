<template>
  <section class="hero-section">
    <div class="hero-overlay">
      <div class="hero-content">
        <h1 class="hero-title">西南话剧图鉴</h1>
        <p class="hero-subtitle">A Guide to Southwestern Chinese Drama</p>
        <el-button class="hero-button" type="primary" @click="handleEnter">点击进入</el-button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const handleEnter = () => {
  // 滚动到下一个区域或执行其他进入逻辑
  document.querySelector('.region-section')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<style scoped>
.hero-section {
  position: relative;
  height: 90vh;
  background: linear-gradient(to bottom, #333, #1a1a1a);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-content {
  text-align: center;
  color: #fff;
  padding: 20px;
}

.hero-title {
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 10px;
  letter-spacing: 3px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.hero-subtitle {
  font-size: 20px;
  margin-bottom: 40px;
  letter-spacing: 1px;
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

/* 响应式设计 */
@media (max-width: 768px) {
  .hero-title {
    font-size: 36px;
  }
  
  .hero-subtitle {
    font-size: 16px;
  }
  
  .hero-button {
    font-size: 16px;
    padding: 10px 28px;
  }
}
</style>