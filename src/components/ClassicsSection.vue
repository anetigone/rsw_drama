<template>
  <section class="classics-section">
    <div class="section-container">
      <h2 class="section-title">THE CLASSICS</h2>
      <p class="section-subtitle">经典汇编</p>
      
      <div class="classics-carousel">
        <el-carousel
          :interval="5000"
          type="card"
          height="400px"
          indicator-position="none"
        >
          <el-carousel-item v-for="(classic, index) in classics" :key="index">
            <div class="classic-card">
              <div class="classic-image"></div>
              <h3 class="classic-title">{{ classic.title }}</h3>
              <p class="classic-description">{{ classic.description }}</p>
            </div>
          </el-carousel-item>
        </el-carousel>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface Classic {
  title: string
  description: string
}

const classics: Classic[] = [
  {
    title: '文献集',
    description: '收集整理西南地区话剧相关历史文献资料'
  },
  {
    title: '话剧集',
    description: '收录经典西南话剧剧本与演出记录'
  },
  {
    title: '翻译集',
    description: '展示西南地区话剧翻译成果'
  }
]
</script>

<style scoped>
.classics-section {
  padding: 80px 0;
  background-color: #f8f8f8;
}

.section-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-title {
  font-size: 18px;
  color: #666;
  text-align: center;
  margin-bottom: 10px;
  letter-spacing: 2px;
  font-weight: normal;
}

.section-subtitle {
  font-size: 36px;
  color: #1a1a1a;
  text-align: center;
  margin-bottom: 60px;
  letter-spacing: 1px;
  font-weight: bold;
}

.classics-carousel {
  width: 100%;
}

.el-carousel--card .el-carousel__item {
  background-color: transparent;
  border-radius: 4px;
}

.classic-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  padding: 30px;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.classic-image {
  width: 100%;
  height: 200px;
  background-color: #e0e0e0;
  margin-bottom: 20px;
  border-radius: 4px;
}

.classic-title {
  font-size: 24px;
  color: #1a1a1a;
  margin-bottom: 15px;
  text-align: center;
  letter-spacing: 1px;
}

.classic-description {
  font-size: 16px;
  color: #666;
  text-align: center;
  line-height: 1.6;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .classics-section {
    padding: 60px 0;
  }
  
  .section-subtitle {
    font-size: 28px;
  }
  
  .el-carousel--card {
    width: 90%;
    margin: 0 auto;
  }
}
</style>