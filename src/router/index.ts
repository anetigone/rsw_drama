import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ActivitiesView from '../views/ActivitiesView.vue'
import ActivityDetailView from '../views/ActivityDetailView.vue'

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
  }
]

const router = createRouter({
  history: createWebHistory('/'),
  routes
})

export default router