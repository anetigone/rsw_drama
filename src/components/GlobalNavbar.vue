<template>
  <el-header class="global-navbar">
    <div class="navbar-container">
      <div class="navbar-brand">西南话剧图鉴</div>
      <el-menu
        :default-active="activeIndex"
        class="navbar-menu"
        mode="horizontal"
        text-color="#fff"
        background-color="#1a1a1a"
        active-text-color="#c8a97e"
        @select="handleSelect"
      >
        <el-menu-item index="1">首页</el-menu-item>
        <el-menu-item index="2">经典汇编</el-menu-item>
        <el-menu-item index="3">文思集录</el-menu-item>
        <el-menu-item index="4">活动纪实</el-menu-item>
        <el-menu-item index="5">关于我们</el-menu-item>
      </el-menu>
    </div>
  </el-header>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const activeIndex = ref('1')

const handleSelect = (index: string) => {
  activeIndex.value = index
  // 这里可以添加导航跳转逻辑
}
</script>

<style scoped>
.global-navbar {
  background-color: #1a1a1a;
  padding: 0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 20px;
}

.navbar-brand {
  color: #fff;
  font-size: 20px;
  font-weight: bold;
  letter-spacing: 1px;
}

.navbar-menu {
  border: none;
}

.el-menu--horizontal {
  border-bottom: none;
}

.el-menu-item {
  font-size: 16px;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
}

.el-menu-item:hover {
  background-color: rgba(200, 169, 126, 0.1);
}
</style>