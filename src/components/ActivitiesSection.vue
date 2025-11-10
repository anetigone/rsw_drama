<template>
  <section class="activities-section">
    <div class="section-container">
      <h2 class="section-title">THE ACTIVITIES</h2>
      <p class="section-subtitle">活动纪实</p>
      
      <!-- 图片层叠区域 -->
      <div class="images-container">
        <!-- 底层右侧大图片 -->
        <div class="bottom-layer">
          <img src="/images/activities/4.jpg" alt="活动纪实大图" class="large-image" />
        </div>
        
        <!-- 上层左侧小图片 -->
        <div class="top-layer">
          <el-row :gutter="10">
            <el-col :span="24">
              <div class="top-row-1">
                <div class="small-image-container narrow">
                  <img src="/images/activities/1.jpg" alt="活动图片1" class="small-image img-edge-fade" />
                </div>
                <div class="small-image-container wide">
                  <img src="/images/activities/2.jpg" alt="活动图片2" class="small-image img-edge-fade" />
                </div>
              </div>
            </el-col>
            <el-col :span="24">
              <div class="top-row-2">
                <div class="small-image-container full-width">
                  <img src="/images/activities/3.jpg" alt="活动图片3" class="small-image img-edge-fade" />
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
      
      <!-- 活动列表区域 -->
      <div class="activities-list-container">
        <h3 class="list-title">近期活动</h3>
        <div class="activities-list">
          <div v-for="(activity, index) in activities" :key="index" class="activity-item">
            <div class="activity-info">
              <h4 class="activity-title">{{ activity.title }}</h4>
              <p class="activity-date">{{ activity.date }}</p>
              <p class="activity-description">{{ activity.description }}</p>
            </div>
          </div>
        </div>
        <button class="more-button" @click="handleMore">更多活动 <span class="arrow">→</span></button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface Activity {
  title: string
  date: string
  description: string
}

const activities: Activity[] = [
  {
    title: '《战友》',
    date: '1941年11月',
    description: '表现革命战士坚定信念和深厚友谊的经典剧作，展现了抗战时期革命者的精神风貌。'
  },
  {
    title: '《回春之曲》',
    date: '1942年3月',
    description: '描写知识分子投身抗日救亡运动的感人故事，通过艺术形式传递爱国主义精神。'
  },
  {
    title: '《放下你的鞭子》',
    date: '1940年8月',
    description: '抗战时期著名街头剧，由陈鲤庭根据田汉的独幕剧改编，激发了广大民众的爱国热情。'
  }
]

const handleMore = () => {
  // 处理"更多"按钮点击事件
  console.log('查看更多活动')
}
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

/* 图片层叠区域样式 */
.images-container {
  position: relative;
  margin-bottom: 60px;
  height: 600px;
}

.bottom-layer {
  position: absolute;
  right: 0;
  top: 0;
  width: 80%;
  height: 100%;
  z-index: 1;
}

.large-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(80%) sepia(20%);
  border: 1px solid #e0e0e0;
}

.top-layer {
  position: absolute;
  left: 0;
  top: 50px;
  width: 55%;
  height: 80%;
  z-index: 2;
}

.top-row-1 {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.narrow {
  flex: 1;
}

.wide {
  flex: 2;
}

.full-width {
  width: 100%;
}

.small-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(80%) sepia(20%);
  border: 1px solid #e0e0e0;
  transition: transform 0.3s ease;
}

/* 边缘渐变透明效果 */
.img-edge-fade {
  /* 为多浏览器兼容性设置 */
  mask-image: linear-gradient(to top, transparent 10px, black 20px),
              linear-gradient(to bottom, transparent 10px, black 20px),
              linear-gradient(to left, transparent 10px, black 20px),
              linear-gradient(to right, transparent 10px, black 20px);
  mask-composite: intersect;
  -webkit-mask-image: linear-gradient(to top, transparent 10px, black 20px),
                      linear-gradient(to bottom, transparent 10px, black 20px),
                      linear-gradient(to left, transparent 10px, black 20px),
                      linear-gradient(to right, transparent 10px, black 20px);
  -webkit-mask-composite: source-in;
}

.small-image:hover {
  transform: scale(1.02);
}

.small-image-container {
  overflow: hidden;
  height: 240px;
}

.top-row-2 {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

/* 活动列表区域样式 */
.activities-list-container {
  background-color: #fff;
  padding: 30px;
  border: 1px solid #e0e0e0;
}

.list-title {
  font-size: 24px;
  color: #1a1a1a;
  margin-bottom: 20px;
  font-family: WenYueXHGuYaSong;
  letter-spacing: 1px;
}

.activities-list {
  display: flex;
  flex-direction: column;
  gap: 25px;
  margin-bottom: 25px;
}

.activity-item {
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 20px;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-info {
  font-family: 'SimSun', serif;
}

.activity-title {
  font-size: 18px;
  color: #1a1a1a;
  margin-bottom: 5px;
  font-weight: bold;
}

.activity-date {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
  font-style: italic;
}

.activity-description {
  font-size: 16px;
  color: #333;
  line-height: 1.8;
  text-align: justify;
}

.more-button {
  background-color: #1a1a1a;
  color: #fff;
  border: none;
  padding: 12px 30px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
}

.more-button:hover {
  background-color: #333;
}

.arrow {
  font-size: 14px;
  transition: transform 0.3s ease;
}

.more-button:hover .arrow {
  transform: translateX(5px);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .images-container {
    height: 400px;
  }
  
  .top-layer {
    width: 50%;
  }
}

@media (max-width: 768px) {
  .activities-section {
    padding: 60px 0;
  }
  
  .section-subtitle {
    font-size: 28px;
  }
  
  .images-container {
    height: auto;
    position: static;
  }
  
  .bottom-layer {
    position: static;
    width: 100%;
    margin-bottom: 20px;
    height: 300px;
  }
  
  .top-layer {
    position: static;
    width: 100%;
  }
  
  .activities-list-container {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .top-row-1 {
    flex-direction: column;
  }
  
  .small-image-container {
    height: 200px;
  }
  
  .activities-list {
    gap: 20px;
  }
  
  .more-button {
    width: 100%;
    justify-content: center;
  }
}
</style>