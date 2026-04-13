<template>
  <div class="admin-view">
    <div class="page-header">
      <div class="header-container">
        <div class="header-content">
          <div class="header-left">
            <h1 class="page-title">系统管理</h1>
            <p class="page-subtitle">管理系统的分类和数据</p>
          </div>
          <div class="header-right">
            <el-button type="danger" @click="handleLogout">
              退出登录
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <div class="admin-container">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="分类管理" name="categories">
          <CategoryManager />
        </el-tab-pane>
        <el-tab-pane label="文献管理" name="literatures">
          <LiteratureManager />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import CategoryManager from '../components/CategoryManager.vue';
import LiteratureManager from '../components/LiteratureManager.vue';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const activeTab = ref('categories');

const handleLogout = () => {
  authStore.logout();
  ElMessage.success('已退出登录');
  router.push('/login');
};
</script>

<style scoped>
.admin-view {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.page-header {
  background-color: #1a1a1a;
  color: #fff;
  padding: 60px 0;
  text-align: center;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.header-left {
  flex: 1;
  text-align: center;
}

.header-right {
  flex-shrink: 0;
}

.page-title {
  font-family: WenYueXHGuYaSong;
  font-size: 48px;
  margin-bottom: 20px;
  letter-spacing: 2px;
}

.page-subtitle {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.8);
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
}

.admin-container {
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.coming-soon {
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-size: 18px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    padding: 40px 0;
  }

  .page-title {
    font-size: 36px;
  }

  .admin-container {
    margin: 20px auto;
    padding: 0 15px;
  }

  .header-content {
    flex-direction: column;
    gap: 30px;
  }

  .header-left {
    text-align: center;
  }
}
</style>
