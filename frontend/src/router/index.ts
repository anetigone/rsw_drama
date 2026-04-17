import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// 路由懒加载 - 只有在访问时才加载对应组件，提高首屏加载速度
const HomeView = () => import('../views/HomeView.vue')
const ActivitiesView = () => import('../views/ActivitiesView.vue')
const ActivityDetailView = () => import('../views/ActivityDetailView.vue')
const LiteratureView = () => import('../views/LiteratureView.vue')
const LiteratureDetailView = () => import('../views/LiteratureDetailView.vue')
const TheoryView = () => import('../views/TheoryView.vue')
const TheoryDetailView = () => import('../views/TheoryDetailView.vue')
const AdminView = () => import('../views/AdminView.vue')
const LoginView = () => import('../views/LoginView.vue')
const UnderConstructionView = () => import('../views/UnderConstructionView.vue')
const QuestionnaireHomeView = () => import('../views/QuestionnaireHomeView.vue')
const QuestionnaireView = () => import('../views/QuestionnaireView.vue')

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
    path: '/theory',
    meta: {
      title: '文思集录'
    },
    name: 'Theory',
    component: TheoryView
  },
  {
    path: '/theory/:id',
    meta: {
      title: '理论详情'
    },
    name: 'TheoryDetail',
    component: TheoryDetailView
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
  },
  {
    path: '/questionnaire',
    meta: {
      title: '问卷调查'
    },
    name: 'QuestionnaireHome',
    component: QuestionnaireHomeView
  },
  {
    path: '/questionnaire/fill',
    meta: {
      title: '填写问卷'
    },
    name: 'Questionnaire',
    component: QuestionnaireView
  },
  {
    path: '/:pathMatch(.*)*',
    meta: {
      title: '页面开发中'
    },
    name: 'UnderConstruction',
    component: UnderConstructionView
  }
]

const router = createRouter({
  history: createWebHistory('/'),
  routes
})

// 路由守卫
router.beforeEach(async (to, _from, next) => {
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
    // 只有在用户信息不存在时才验证，避免每次都调用验证接口
    if (!authStore.user && authStore.token) {
      try {
        const isValid = await authStore.verify()
        if (!isValid) {
          // token 无效,跳转到登录页
          next({
            name: 'Login',
            query: { redirect: to.fullPath }
          })
          return
        }
      } catch (error) {
        // 验证接口调用失败，清除登录状态并跳转登录页
        authStore.logout()
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