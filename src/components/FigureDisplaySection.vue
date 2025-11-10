<template>
  <section class="figure-section">
    <div class="section-container">
      
      <el-row :gutter="20" class="figure-row">
        <el-col
          v-for="(figure, index) in figures"
          :key="index"
          :xs="12"
          :sm="8"
          :md="4"
          :lg="4"
          class="figure-col"
        >
          <div class="figure-container">
            <img 
              :src="figure.image" 
              :alt="figure.name" 
              class="figure-image"
            >
            <div class="figure-info">
              <h3 class="figure-name">{{ figure.name }}</h3>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
  </section>
</template>

<script setup lang="ts">
interface Figure {
  name: string
  image: string
}

const figures: Figure[] = [
  { name: '任国桢', image: '/images/person/任国桢.jpg' },
  { name: '余上沅', image: '/images/person/余上沅.jpg' },
  { name: '应云为', image: '/images/person/应云为.jpg' },
  { name: '张骏祥', image: '/images/person/张骏祥.jpg' },
  { name: '曹禺', image: '/images/person/曹禺.jpg' },
  { name: '梁宗岱', image: '/images/person/梁宗岱.jpg' }
]
</script>

<style scoped>
.figure-section {
  padding: 80px 0;
  background-color: #f8f8f8;
}

.section-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-title {
  font-family: WenYueXHGuYaSong;
  font-size: 18px;
  color: #666;
  text-align: center;
  margin-bottom: 10px;
  letter-spacing: 2px;
  font-weight: normal;
}

.section-subtitle {
  font-family: WenYueXHGuYaSong;
  font-size: 36px;
  color: #1a1a1a;
  text-align: center;
  margin-bottom: 60px;
  letter-spacing: 1px;
  font-weight: bold;
}

.figure-row {
  margin: 0 -10px;
}

.figure-col {
  padding: 0 10px;
  margin-bottom: 30px;
}

.figure-container {
  width: 100%;
  transition: all 0.3s ease;
}

.figure-image {
  width: 100%;
  aspect-ratio: 3/4;
  object-fit: cover;
  display: block;
  /* 保留图片原始质感 */
  filter: grayscale(0%);
}

.figure-info {
  margin-top: 15px;
  text-align: center;
}

.figure-name {
  display: none;
  font-family: WenYueXHGuYaSong;
  font-size: 18px;
  color: #333;
  letter-spacing: 1px;
  font-weight: normal;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .figure-col {
    margin-bottom: 25px;
  }
}

@media (max-width: 768px) {
  .figure-section {
    padding: 60px 0;
  }
  
  .section-subtitle {
    font-size: 28px;
    margin-bottom: 40px;
  }
  
  .figure-col {
    margin-bottom: 20px;
  }
}

@media (max-width: 480px) {
  .figure-col {
    margin-bottom: 15px;
  }
  
  .figure-name {
    font-size: 16px;
  }
}
</style>