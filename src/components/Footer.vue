<template>
  <footer class="footer">
    <div class="footer-content-wrapper">
      <el-container class="footer-main-container">
        <el-row class="footer-row">
          <el-col :span="24">
            <div class="footer-main-content">
              <h2 class="footer-title">THANK YOU!</h2>
              <p class="footer-invitation">
                If you're interested in our project, welcome you to join us!
              </p>
            </div>
          </el-col>
        </el-row>
      </el-container>
    </div>
    <div class="footer-contact-bottom">
      <p class="footer-email">email: 3257047006@qq.com</p>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ElContainer, ElRow, ElCol } from 'element-plus';
// Footer组件逻辑
</script>

<style scoped>
.footer {
  background-color: #000;
  color: #fff;
  padding: 60px 0 30px;
  position: relative;
}

.footer-content-wrapper {
  max-width: 100%;
}

.footer-main-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.footer-row {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.footer-main-content {
  text-align: left;
  position: relative;
  margin-bottom: 40px;
}

.footer-title {
  font-family: WenYueXHGuYaSong, sans-serif;
  font-size: 36px;
  margin-bottom: 25px;
  letter-spacing: 3px;
  font-weight: bold;
  color: #fff;
  position: relative;
  display: inline-block;
}

.footer-title::after {
  content: '';
  position: absolute;
  bottom: -15px;
  left: 0;
  width: 80px;
  height: 1px;
  background-color: #fff;
}

.footer-invitation {
  font-family: RuiYiSong, serif;
  font-size: 18px;
  line-height: 1.6;
  margin-top: 30px;
  color: #999;
  letter-spacing: 0.5px;
  text-align: left;
}

.footer-contact-bottom {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  text-align: right;
  padding: 0 20px;
  margin-top: 20px;
}

.footer-email {
  font-size: 16px;
  color: #999;
  letter-spacing: 1px;
  font-family: 'Arial', sans-serif;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .footer {
    padding: 50px 0 30px;
  }
  
  .footer-title {
    font-size: 28px;
  }
  
  .footer-invitation {
    font-size: 16px;
  }
  
  .footer-email {
    font-size: 14px;
  }
  
  .footer-contact-bottom {
    text-align: center;
  }
}
</style>