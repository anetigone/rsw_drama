<template>
  <section class="about-section">
    <div class="section-container">
      <h2 class="section-title">ABOUT US</h2>
      <p class="section-subtitle">关于我们</p>
      
      <div class="about-content">
        <div class="about-text">
          <h3 class="about-heading">项目简介</h3>
          <div class="project-intro">
            <p class="intro-paragraph">
              在世界反法西斯战争的历史背景下，我国西南地区因其特殊的地理与战略区位，成为文化抗战与精神凝聚的重要阵地。其中，话剧作为文艺的新形式，在抗战中承担起鼓舞民众、传递理论的关键作用。
            </p>
            <p class="intro-paragraph">
              然而，对战时西南话剧的理论梳理与创新实践却相对零散。因此，本项目将系统开展战时西南话剧传承研究，并引入西方马克思主义文艺理论，通过话剧排演与活动筹办推进当代转化，挖掘其思想与哲学内核，实现跨文化阐释、在地性创新。
            </p>
          </div>
        </div>
        
        <div class="about-contact">
          <div class="qrcode-container">
            <h4 class="official-account-title">公众号</h4>
            <p class="scan-hint">扫描下方二维码，关注公众号</p>
            <div class="qrcode-image">
              <!-- 这里使用一个占位图，实际项目中应替换为真实的二维码图片 -->
              <div class="qrcode-placeholder">
                <span class="qrcode-placeholder-text">二维码图片</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// 可以在这里添加相关的逻辑和数据
</script>

<style scoped>
.about-section {
  padding: 80px 0;
  background-color: #fff;
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

.about-content {
  display: grid;
  grid-template-columns: 6fr 4fr;
  gap: 40px;
  align-items: start;
}

.about-text {
  padding-right: 20px;
}

.about-heading {
  font-family: RuiYiSong;
  font-size: 24px;
  color: #1a1a1a;
  margin-bottom: 25px;
  letter-spacing: 0.5px;
}

.intro-paragraph {
  font-size: 16px;
  color: #333;
  line-height: 1.8;
  margin-bottom: 20px;
  text-align: justify;
}

.about-contact {
  display: flex;
  justify-content: center;
}

.qrcode-container {
  text-align: center;
  border: 2px solid #000;
  padding: 30px 20px;
  width: 100%;
  max-width: 280px;
}

.official-account-title {
  font-family: RuiYiSong;
  font-size: 20px;
  color: #000;
  margin-bottom: 20px;
  font-weight: bold;
}

.scan-hint {
  font-size: 14px;
  color: #333;
  line-height: 1.5;
  margin-bottom: 20px;
}

.qrcode-image {
  display: flex;
  justify-content: center;
}

.qrcode-placeholder {
  width: 200px;
  height: 200px;
  background-color: #fff;
  border: 1px solid #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qrcode-placeholder-text {
  font-size: 16px;
  color: #666;
  letter-spacing: 1px;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .about-content {
    grid-template-columns: 1fr;
    gap: 30px;
  }
  
  .about-text {
    padding-right: 0;
  }
}

@media (max-width: 768px) {
  .about-section {
    padding: 60px 0;
  }
  
  .section-subtitle {
    font-size: 28px;
  }
  
  .about-heading {
    font-size: 20px;
  }
}
</style>