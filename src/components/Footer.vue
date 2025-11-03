<template>
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-content">
        <h2 class="footer-title">THANK YOU!</h2>
        <p class="footer-invitation">
          If you're interested in our project, welcome<br>
you to join us! / 欢迎加入我们！
        </p>
        <p class="footer-email">email: 3257047006@qq.com</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
// 可以在这里添加相关的逻辑
</script>

<style scoped>
.footer {
  background-color: #1a1a1a;
  color: #fff;
  padding: 60px 0;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.footer-content {
  text-align: center;
}

.footer-title {
  font-size: 32px;
  margin-bottom: 20px;
  letter-spacing: 2px;
  font-weight: bold;
}

.footer-invitation {
  font-size: 18px;
  line-height: 1.8;
  margin-bottom: 30px;
  color: #e0e0e0;
  letter-spacing: 0.5px;
}

.footer-email {
  font-size: 16px;
  color: #c8a97e;
  letter-spacing: 1px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .footer {
    padding: 40px 0;
  }
  
  .footer-title {
    font-size: 24px;
  }
  
  .footer-invitation {
    font-size: 16px;
  }
  
  .footer-email {
    font-size: 14px;
  }
}
</style>