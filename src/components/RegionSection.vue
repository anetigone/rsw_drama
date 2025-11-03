<template>
  <section class="region-section">
    <div class="section-container">
      <h2 class="section-title">THE REGION</h2>
      <p class="section-subtitle">地区</p>
      
      <div class="region-grid">
        <div v-for="region in regions" :key="region.id" class="region-card">
          <div class="region-map" :style="{ backgroundColor: region.color }"></div>
          <h3 class="region-name">{{ region.name }}</h3>
          <p class="region-en-name">{{ region.enName }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface Region {
  id: number
  name: string
  enName: string
  color: string
}

const regions: Region[] = [
  { id: 1, name: '重庆', enName: 'CHONG QING', color: '#7a93ac' },
  { id: 2, name: '昆明', enName: 'KUN MING', color: '#9c9c9c' },
  { id: 3, name: '宜宾', enName: 'YI BING', color: '#8a7065' },
  { id: 4, name: '成都', enName: 'CHENG DU', color: '#7c6d5a' }
]
</script>

<style scoped>
.region-section {
  padding: 80px 0;
  background-color: #fff;
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

.region-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.region-card {
  text-align: center;
  transition: transform 0.3s ease;
}

.region-card:hover {
  transform: translateY(-5px);
}

.region-map {
  width: 100%;
  height: 200px;
  margin-bottom: 20px;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.region-name {
  font-size: 24px;
  color: #1a1a1a;
  margin-bottom: 10px;
  letter-spacing: 1px;
}

.region-en-name {
  font-size: 16px;
  color: #666;
  letter-spacing: 2px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .region-section {
    padding: 60px 0;
  }
  
  .section-subtitle {
    font-size: 28px;
  }
  
  .region-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 480px) {
  .region-grid {
    grid-template-columns: 1fr;
  }
}
</style>