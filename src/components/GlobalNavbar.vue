<template>
  <el-header class="global-navbar">
    <div class="navbar-container">
      <!-- 左侧：网站icon和名称 -->
      <div class="navbar-brand" @click="navigateTo('home')">
        <img 
          :style="{ height: '20px', marginRight: '10px' }"
          src="../assets/vue.svg"
          alt="西南话剧图鉴"
        />
        <span>西南话剧图鉴</span>
      </div>
      
      <!-- 大屏幕：目录导航 -->
      <div class="main-nav desktop-only">
        <el-menu
          :default-active="activeIndex"
          class="nav-menu"
          mode="horizontal"
          :ellipsis="false"
          text-color="#fff"
          background-color="transparent"
          active-text-color="#fff"
          @select="handleMenuSelect"
        >
          <el-menu-item index="home" @click="navigateTo('home')">首页</el-menu-item>
          <el-menu-item index="classics" @click="navigateTo('classics')">经典汇编</el-menu-item>
          <el-menu-item index="thoughts" @click="navigateTo('thoughts')">文思集录</el-menu-item>
          <el-menu-item index="activities" @click="navigateTo('activities')">活动纪实</el-menu-item>
          <el-menu-item index="about" @click="navigateTo('about')">关于我们</el-menu-item>
        </el-menu>
      </div>
      
      <!-- 右侧区域 -->
      <div class="navbar-right">
        <!-- 大屏幕：搜索框 -->
        <div class="desktop-only">
          <el-input
            v-model="searchQuery"
            placeholder="搜索站内内容"
            class="search-input"
            :prefix-icon="Search"
            @keyup.enter="handleSearch"
          />
        </div>
        
        <!-- 小屏幕：搜索图标 -->
        <div class="mobile-only">
          <div class="nav-icon search-icon" @click="handleSearchClick">
            <img src="../assets/search.svg" alt="搜索" class="icon-img" />
          </div>
        </div>
        
        <!-- 大屏幕：个人中心和首页图标 -->
        <div class="desktop-only">
          <div class="nav-icon" @click="navigateTo('profile')">
            <img src="../assets/profile.svg" alt="个人中心" class="icon-img" />
          </div>
          <div class="nav-icon" @click="navigateTo('home')">
            <img src="../assets/home.svg" alt="首页" class="icon-img" />
          </div>
        </div>
        
        <!-- 小屏幕：目录图标 -->
        <div class="mobile-only">
          <div class="nav-icon menu-icon" @click="toggleMobileMenu">
            <img src="../assets/menu.svg" alt="菜单" class="icon-img" />
          </div>
        </div>
      </div>
      
      <!-- 移动端下拉菜单 -->
      <div v-if="mobileMenuVisible" class="mobile-dropdown-menu">
        <div class="dropdown-header">
          <span>目录</span>
          <div class="close-btn" @click="toggleMobileMenu">×</div>
        </div>
        <div class="dropdown-content">
          <div 
            v-for="item in mobileMenuItems" 
            :key="item.key"
            class="dropdown-item"
            :class="{ active: activeIndex === item.key }"
            @click="handleMobileItemClick(item.key)"
          >
            {{ item.label }}
          </div>
        </div>
      </div>
      
      <!-- 搜索遮罩层 -->
      <div v-if="showSearchPanel" class="search-overlay" @click.self="closeSearchPanel">
        <div class="search-panel">
          <div class="search-panel-header">
            <span>搜索</span>
            <div class="close-btn" @click="closeSearchPanel">×</div>
          </div>
          <div class="search-panel-content">
            <el-input
              v-model="searchQuery"
              placeholder="搜索站内内容"
              class="search-input-large"
              prefix-icon="el-icon-search"
              @keyup.enter="handleSearch"
              ref="searchInputRef"
            />
          </div>
        </div>
      </div>
    </div>
  </el-header>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'

// 响应式数据
const activeIndex = ref('home')
const searchQuery = ref('')
const mobileMenuVisible = ref(false)
const showSearchPanel = ref(false)
const searchInputRef = ref()
const router = useRouter()

// 移动端菜单项
const mobileMenuItems = [
  { key: 'home', label: '首页' },
  { key: 'classics', label: '经典汇编' },
  { key: 'thoughts', label: '文思集录' },
  { key: 'activities', label: '活动纪实' },
  { key: 'about', label: '关于我们' },
  { key: 'profile', label: '个人中心' }
]

// 导航方法 - 预留接口
const navigateTo = (route: string) => {
  activeIndex.value = route
  console.log(`导航到: ${route}`)
  
  // 根据不同路由执行不同的导航逻辑
  switch (route) {
    case 'home':
      router.push('/')
      break
    case 'classics':
      router.push('/classics')
      break
    case 'thoughts':
      router.push('/thoughts')
      break
    case 'activities':
      router.push('/activities')
      break
    case 'about':
      router.push('/about')
      break
    case 'profile':
      // 这里可以添加登录检查逻辑
      console.log('跳转到个人中心/登录页')
      router.push('/profile')
      break
    default:
      break
  }
}

// 菜单选择处理
const handleMenuSelect = (index: string) => {
  activeIndex.value = index
  navigateTo(index)
}

// 移动端菜单项点击处理
const handleMobileItemClick = (key: string) => {
  activeIndex.value = key
  mobileMenuVisible.value = false
  navigateTo(key)
}

// 切换移动端菜单显示
const toggleMobileMenu = () => {
  mobileMenuVisible.value = !mobileMenuVisible.value
  showSearchPanel.value = false // 关闭搜索面板
}

// 处理搜索
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    console.log('搜索内容:', searchQuery.value)
    // 这里可以添加搜索逻辑
    showSearchPanel.value = false
  }
}

// 点击搜索图标
const handleSearchClick = () => {
  showSearchPanel.value = !showSearchPanel.value
  mobileMenuVisible.value = false // 关闭菜单
  
  // 自动聚焦到搜索框
  if (showSearchPanel.value) {
    nextTick(() => {
      if (searchInputRef.value) {
        searchInputRef.value.focus()
      }
    })
  }
}

// 关闭搜索面板
const closeSearchPanel = () => {
  showSearchPanel.value = false
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
  position: relative;
}

/* 网站Logo和名称 */
.navbar-brand {
  color: #fff;
  font-size: 20px;
  font-weight: bold;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.navbar-brand:hover {
  opacity: 0.9;
}

/* 大屏幕主导航 */
.main-nav {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  margin-right: 20px;
}

.nav-menu {
  border: none;
  background-color: transparent !important;
  margin-right: 0;
}

.nav-menu .el-menu-item {
  font-family: 'Open Sans', sans-serif;
  font-size: 16px;
  letter-spacing: 0.5px;
  padding: 0 20px;
  height: 60px;
  line-height: 60px;
  color: #fff;
  background-color: transparent;
  transition: all 0.3s ease;
}

.nav-menu .el-menu-item:hover {
  color: #fff;
  background-color: transparent;
  opacity: 0.9;
}

/* 选中项添加白色下划线 */
.nav-menu .el-menu-item.is-active {
  color: #fff;
  position: relative;
}

.nav-menu .el-menu-item.is-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 2px;
  background-color: #fff;
  transition: all 0.3s ease;
}

.nav-menu .el-menu--horizontal > .el-menu-item {
  margin: 0;
}

.nav-menu .el-menu--horizontal > .el-menu {
  border-bottom: none;
}

/* 右侧功能区 */
.navbar-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

/* 搜索框样式 */
.search-input {
  width: 200px;
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.search-input .el-input__inner {
  background-color: transparent;
  color: #fff;
  height: 32px;
}

.search-input .el-input__inner::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

/* 图标样式 */
.nav-icon {
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.nav-icon:hover {
  background-color: rgba(200, 169, 126, 0.1);
}

.icon-img {
  width: 20px;
  height: 20px;
  filter: brightness(0) invert(1); /* 确保图标在深色背景上显示为白色 */
}

/* 移动端下拉菜单 */
.mobile-dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: #1a1a1a;
  width: 200px;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 101;
  overflow: hidden;
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  font-size: 16px;
  font-weight: bold;
}

.dropdown-content {
  padding: 8px 0;
}

.dropdown-item {
  padding: 10px 16px;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dropdown-item:hover {
  background-color: rgba(200, 169, 126, 0.1);
}

.dropdown-item.active {
  background-color: rgba(200, 169, 126, 0.2);
  color: #c8a97e;
}

.close-btn {
  font-size: 20px;
  color: #fff;
  cursor: pointer;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

/* 搜索遮罩层和面板 */
.search-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-panel {
  width: 90%;
  max-width: 600px;
  background-color: #1a1a1a;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.search-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  font-size: 18px;
  font-weight: bold;
}

.search-panel-content {
  padding: 20px;
}

.search-input-large {
  width: 100%;
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.search-input-large .el-input__inner {
  background-color: transparent;
  color: #fff;
  height: 40px;
  font-size: 16px;
}

.search-input-large .el-input__inner::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

/* 响应式显示控制 */
.desktop-only {
  display: flex;
}

.mobile-only {
  display: none;
}

/* 响应式设计 */
@media (max-width: 1000px) {
  .desktop-only {
    display: none;
  }
  
  .mobile-only {
    display: flex;
  }
  
  .navbar-container {
    padding: 0 15px;
  }
  
  .navbar-brand {
    font-size: 18px;
  }
  
  .navbar-brand img {
    height: 18px;
    margin-right: 8px;
  }
  
  .navbar-right {
    gap: 10px;
  }
  
  .nav-icon {
    padding: 6px;
  }
  
  .icon-img {
    width: 18px;
    height: 18px;
  }
}

@media (max-width: 480px) {
  .navbar-container {
    padding: 0 10px;
  }
  
  .navbar-brand {
    font-size: 16px;
  }
  
  .navbar-brand img {
    height: 16px;
    margin-right: 6px;
  }
  
  .navbar-right {
    gap: 8px;
  }
  
  .mobile-dropdown-menu {
    width: 180px;
  }
}
</style>