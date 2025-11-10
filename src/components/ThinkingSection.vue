<template>
  <section class="thinking-section">
    <div class="section-container">
      <h2 class="section-title">THE THINKING</h2>
      <p class="section-subtitle">文思集录</p>
      
      <div class="thinking-content">
        <div class="thinking-image"></div>
        <div class="thinking-text">
          <p class="text-paragraph">
            1937年7月7日，抗日战争爆发。此后，中华教育界、文艺界开始了一场规模宏大的西迁运动。
          </p>
          <p class="text-paragraph">
            在这场运动中，众多高校、文化机构纷纷迁至西南地区。西南联大、国立剧专等重要文化教育机构的南迁，
            为西南地区带来了先进的文化思想和艺术实践。
          </p>
          <p class="text-paragraph">
            话剧作为一种新兴的艺术形式，在抗战时期的西南地区得到了蓬勃发展。众多戏剧家、文学家、艺术家在此
            开展创作与演出活动，形成了独具特色的西南话剧文化圈。
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// 可以在这里添加相关的逻辑和数据
</script>

<style scoped>
.thinking-section {
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

.thinking-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: center;
}

.thinking-image {
  width: 100%;
  height: 400px;
  background-image: url('/images/thinking/1.jpg');
  background-size: cover;
  background-position: center;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.thinking-text {
  padding: 20px;
}

.text-paragraph {
  font-size: 18px;
  color: #333;
  line-height: 1.8;
  margin-bottom: 25px;
  text-align: justify;
  letter-spacing: 0.5px;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .thinking-content {
    grid-template-columns: 1fr;
    gap: 30px;
  }
  
  .thinking-image {
    height: 300px;
  }
}

@media (max-width: 768px) {
  .thinking-section {
    padding: 60px 0;
  }
  
  .section-subtitle {
    font-size: 28px;
  }
  
  .text-paragraph {
    font-size: 16px;
  }
}
</style>