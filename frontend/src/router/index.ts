import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import HomeView from '../views/HomeView.vue'
import ActivitiesView from '../views/ActivitiesView.vue'
import ActivityDetailView from '../views/ActivityDetailView.vue'
import LiteratureView from '../views/LiteratureView.vue'
import LiteratureDetailView from '../views/LiteratureDetailView.vue'
import AdminView from '../views/AdminView.vue'
import LoginView from '../views/LoginView.vue'

const routes = [
  {
    path: '/',
    meta: {
      title: 'Home'
    },
    name: 'Home',
    component: HomeView
  },
  {
    path: '/activities',
    meta: {
      title: '活动纪实'
    },
    name: 'Activities',
    component: ActivitiesView
  },
  {
    path: '/activity/:id',
    meta: {
      title: '活动详情'
    },
    name: 'ActivityDetail',
    component: ActivityDetailView
  },
  {
    path: '/literature',
    meta: {
      title: '经典汇编'
    },
    name: 'Literature',
    component: LiteratureView
  },
  {
    path: '/literature/:id',
    meta: {
      title: '文献详情'
    },
    name: 'LiteratureDetail',
    component: LiteratureDetailView
  },
  {
    path: '/login',
    meta: {
      title: '登录',
      public: true
    },
    name: 'Login',
    component: LoginView
  },
  {
    path: '/admin',
    meta: {
      title: '系统管理',
      requiresAuth: true
    },
    name: 'Admin',
    component: AdminView
  }
]

const router = createRouter({
  history: createWebHistory('/'),
  routes
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // 如果路由需要认证
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      // 未登录,跳转到登录页
      next({
        name: 'Login',
        query: { redirect: to.fullPath }
      })
      return
    }

    // 已登录但未验证用户信息,尝试验证
    if (!authStore.user) {
      const isValid = await authStore.verify()
      if (!isValid) {
        // token 无效,跳转到登录页
        next({
          name: 'Login',
          query: { redirect: to.fullPath }
        })
        return
      }
    }
  }

  // 如果已登录且访问登录页,跳转到首页
  if (to.name === 'Login' && authStore.isAuthenticated) {
    next({ name: 'Home' })
    return
  }

  next()
})

export default router