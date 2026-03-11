import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes = [
  {
    path: '/',
    meta: {
      title: 'Home'
    },
    name: 'Home',
    component: HomeView
  }
]

const router = createRouter({
  history: createWebHistory('/rsw_drama/'),
  routes
})

export default router