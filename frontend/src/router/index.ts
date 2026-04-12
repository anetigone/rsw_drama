import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ActivitiesView from '../views/ActivitiesView.vue'
import ActivityDetailView from '../views/ActivityDetailView.vue'
import LiteratureView from '../views/LiteratureView.vue'
import LiteratureDetailView from '../views/LiteratureDetailView.vue'

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
  }
]

const router = createRouter({
  history: createWebHistory('/'),
  routes
})

export default router