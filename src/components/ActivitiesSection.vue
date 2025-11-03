<template>
  <section class="activities-section">
    <div class="section-container">
      <h2 class="section-title">THE ACTIVITIES</h2>
      <p class="section-subtitle">活动纪实</p>
      
      <div class="activities-grid">
        <div v-for="(activity, index) in activities" :key="index" class="activity-card">
          <div class="activity-image"></div>
          <div class="activity-content">
            <h3 class="activity-title">{{ activity.title }}</h3>
            <p class="activity-description">{{ activity.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface Activity {
  title: string
  description: string
}

const activities: Activity[] = [
  {
    title: '《放下你的鞭子》',
    description: '抗战时期著名街头剧，由陈鲤庭根据田汉的独幕剧改编'
  },
  {
    title: '《保卫芦沟桥》',
    description: '1937年8月在上海首演，标志着抗战戏剧运动的开始'
  },
  {
    title: '《蜕变》',
    description: '曹禺创作于1939年，反映抗战时期知识分子的精神觉醒'
  },
  {
    title: '《棠棣之花》',
    description: '郭沫若历史剧代表作，借古喻今，激发民族精神'
  }
]
</script>

<style scoped>
.activities-section {
  padding: 80px 0;
  background-color: #f5f5f5;
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

.activities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
}

.activity-card {
  background-color: #fff;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.activity-card:hover {
  transform: translateY(-5px);
}

.activity-image {
  width: 100%;
  height: 200px;
  background-color: #e0e0e0;
}

.activity-content {
  padding: 20px;
}

.activity-title {
  font-size: 20px;
  color: #1a1a1a;
  margin-bottom: 15px;
  letter-spacing: 0.5px;
}

.activity-description {
  font-size: 16px;
  color: #666;
  line-height: 1.6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .activities-section {
    padding: 60px 0;
  }
  
  .section-subtitle {
    font-size: 28px;
  }
  
  .activities-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 480px) {
  .activities-grid {
    grid-template-columns: 1fr;
  }
}
</style>